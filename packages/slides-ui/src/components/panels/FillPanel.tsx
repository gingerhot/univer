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

import type { Nullable } from '@univerjs/core';

import type { Rect } from '@univerjs/engine-render';
import { ICommandService, LocaleService } from '@univerjs/core';
import { clsx, ColorPicker, Dropdown } from '@univerjs/design';
import { MoreDownSingle, PaintBucket } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';

import React from 'react';
import { UpdateSlideElementOperation } from '../../commands/operations/update-element.operation';
import { CanvasView } from '../../controllers/canvas-view';
import styles from './index.module.less';

interface IProps {
    pageId: string;
    unitId: string;
}

/**
 *
 * @param props
 */
export default function ArrangePanel(props: IProps) {
    const { pageId, unitId } = props;

    const localeService = useDependency(LocaleService);
    const canvasView = useDependency(CanvasView);
    const commandService = useDependency(ICommandService);

    const page = canvasView.getRenderUnitByPageId(pageId, unitId);
    const scene = page?.scene;
    if (!scene) return null;

    const transformer = scene.getTransformer();
    if (!transformer) return null;

    const selectedObjects = transformer.getSelectedObjectMap();
    const object = selectedObjects.values().next().value as Nullable<Rect>;
    if (!object) return null;

    const [color, setColor] = React.useState<string>(object.fill?.toString() ?? '');

    /**
     *
     * @param color
     */
    function handleChangeColor(color: string) {
        object?.setProps({
            fill: color,
        });
        commandService.executeCommand(UpdateSlideElementOperation.id, {
            unitId,
            oKey: object?.oKey,
            props: {
                shape: {
                    shapeProperties: {
                        shapeBackgroundFill: {
                            rgb: color,
                        },
                    },
                },
            },
        });
        setColor(color);
    }

    return (
        <div
            className={clsx(styles.imageCommonPanelGrid, styles.imageCommonPanelBorder)}
        >
            <div className={styles.imageCommonPanelGrid}>
                <div className={styles.imageCommonPanelRow}>
                    <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelTitle)}>
                        <div>{localeService.t('slide.panel.fill.title')}</div>
                    </div>
                </div>
                <div className={styles.imageCommonPanelRow}>
                    <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                        <Dropdown
                            overlay={(
                                <div className="univer-rounded-lg univer-p-4">
                                    <ColorPicker
                                        value="#fff"
                                        onChange={handleChangeColor}
                                    />
                                </div>
                            )}
                        >
                            <a className={styles.uiPluginSheetsBorderPanelButton}>
                                <PaintBucket extend={{ colorChannel1: color ?? 'rgb(var(--primary-color))' }} />
                                <span className={styles.uiPluginSheetsBorderPanelMoreIcon}>
                                    <MoreDownSingle />
                                </span>
                            </a>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </div>
    );
}
