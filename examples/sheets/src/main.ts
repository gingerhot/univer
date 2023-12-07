import { LocaleType, Univer } from '@univerjs/core';
import { greenTheme } from '@univerjs/design';
import { DocsPlugin, RichTextEditingMutation } from '@univerjs/docs';
import { BaseFormulaEnginePlugin } from '@univerjs/engine-formula';
import { RenderEngine } from '@univerjs/engine-render';
import { FormulaPlugin } from '@univerjs/formula';
import type { IUniverRPCMainThreadPluginConfig } from '@univerjs/rpc';
import { UniverRPCMainThreadPlugin } from '@univerjs/rpc';
import { SheetsPlugin } from '@univerjs/sheets';
import { FormulaUIPlugin } from '@univerjs/sheets-formula';
import { NumfmtPlugin } from '@univerjs/sheets-numfmt';
import { SheetsUIPlugin } from '@univerjs/sheets-ui';
import { UIPlugin } from '@univerjs/ui';
import type { IUniscriptPluginConfig } from '@univerjs/uniscript';
import { UniscriptPlugin } from '@univerjs/uniscript';
import { DEFAULT_WORKBOOK_DATA_DEMO } from 'data';

import { locales } from './locales';
import { DebuggerPlugin } from './sheets-plugin-debugger';

// univer
const univer = new Univer({
    theme: greenTheme,
    locale: LocaleType.EN_US,
    locales,
});

// core plugins
univer.registerPlugin(DocsPlugin, {
    hasScroll: false,
});
// univer.registerPlugin(DocsUIPlugin);
univer.registerPlugin(RenderEngine);
univer.registerPlugin(UIPlugin, {
    container: 'app',
    header: true,
    toolbar: true,
    footer: true,
});
univer.registerPlugin(SheetsPlugin);
univer.registerPlugin(SheetsUIPlugin);

// sheet feature plugins

univer.registerPlugin(NumfmtPlugin);
univer.registerPlugin(DebuggerPlugin);
univer.registerPlugin(BaseFormulaEnginePlugin);
univer.registerPlugin(FormulaPlugin, {
    notExecuteFormula: true,
});
univer.registerPlugin(FormulaUIPlugin);
univer.registerPlugin(UniverRPCMainThreadPlugin, {
    workerURL: './worker.js',
    unsyncMutations: new Set([RichTextEditingMutation.id]),
} as IUniverRPCMainThreadPluginConfig);

univer.registerPlugin(UniscriptPlugin, {
    getWorkerUrl(moduleID, label) {
        if (label === 'typescript' || label === 'javascript') {
            return './vs/language/typescript/ts.worker.js';
        }

        return './vs/editor/editor.worker.js';
    },
} as IUniscriptPluginConfig);

// create univer sheet instance
univer.createUniverSheet(DEFAULT_WORKBOOK_DATA_DEMO);

declare global {
    interface Window {
        univer?: Univer;
    }
}

window.univer = univer;