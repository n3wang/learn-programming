import {EditorState, Prec} from '@codemirror/state';
import {EditorView, keymap} from '@codemirror/view';

/** Block keyboard, context-menu, drag-drop, and programmatic paste into the editor. */
export function disablePasteExtensions() {
    return [
        Prec.highest(
            keymap.of([
                {key: 'Mod-v', run: () => true, preventDefault: true},
                {key: 'Mod-Shift-v', run: () => true, preventDefault: true},
                {key: 'Shift-Insert', run: () => true, preventDefault: true},
            ])
        ),
        EditorView.domEventHandlers({
            paste(event) {
                event.preventDefault();
                return true;
            },
            drop(event) {
                event.preventDefault();
                return true;
            },
            beforeinput(event) {
                const blocked = ['insertFromPaste', 'insertFromDrop', 'insertFromYank'];
                if (blocked.includes(event.inputType)) {
                    event.preventDefault();
                    return true;
                }
                return false;
            },
        }),
        EditorState.transactionFilter.of((tr) => {
            if (
                tr.isUserEvent('input.paste') ||
                tr.isUserEvent('input.drop') ||
                tr.isUserEvent('paste')
            ) {
                return [];
            }
            return tr;
        }),
    ];
}
