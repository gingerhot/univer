/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { isRealNum } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { floor } from '../../../engine/utils/math-kit';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Trimmean extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(array: BaseValueObject, percent: BaseValueObject): BaseValueObject {
        const arrayValues = this._getValues(array);

        if (percent.isArray()) {
            const resultArray = (percent as ArrayValueObject).mapValue((percentObject) => this._handleSingleObject(arrayValues, percentObject));

            if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        return this._handleSingleObject(arrayValues, percent);
    }

    private _handleSingleObject(array: number[] | ErrorValueObject, percent: BaseValueObject): BaseValueObject {
        if (array instanceof ErrorValueObject) {
            return array;
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(percent);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [percentObject] = variants as BaseValueObject[];

        const percentValue = +percentObject.getValue();

        if (percentValue < 0 || percentValue >= 1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const count = floor(array.length * percentValue / 2, 0) * 2;

        const newArray = array.slice(count / 2, array.length - count / 2);

        const result = newArray.reduce((acc, cur) => acc + cur, 0) / newArray.length;

        return NumberValueObject.create(result);
    }

    private _getValues(array: BaseValueObject): number[] | ErrorValueObject {
        const rowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const columnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        const values: number[] = [];

        for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < columnCount; c++) {
                const valueObject = array.isArray() ? (array as ArrayValueObject).get(r, c) as BaseValueObject : array;

                if (valueObject.isError()) {
                    return valueObject as ErrorValueObject;
                }

                if (valueObject.isNull() || valueObject.isBoolean()) {
                    continue;
                }

                const value = valueObject.getValue();

                if (!isRealNum(value)) {
                    continue;
                }

                values.push(+value);
            }
        }

        if (values.length === 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return values.sort((a, b) => a - b);
    }
}
