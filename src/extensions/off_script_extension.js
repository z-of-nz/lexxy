import { COMMAND_PRIORITY_NORMAL, createCommand, defineExtension, mergeRegister } from "lexical"
import { $getSelection, $isRangeSelection } from "lexical"
import LexxyExtension from "./lexxy_extension"

export const SET_SUP_SCRIPT_COMMAND = createCommand()
export const SET_SUB_SCRIPT_COMMAND = createCommand()

export class OffScriptExtension extends LexxyExtension {
    get enabled() {
        return this.editorElement.supportsRichText
    }

    get lexicalExtension() {
        return defineExtension({
            name: "nz/off_script",
            register: (editor) => mergeRegister(
                editor.registerCommand(SET_SUP_SCRIPT_COMMAND, this.#handleSup.bind(this), COMMAND_PRIORITY_NORMAL),
                editor.registerCommand(SET_SUB_SCRIPT_COMMAND, this.#handleSub.bind(this), COMMAND_PRIORITY_NORMAL)
            )
        })
    }

    #handleSup() {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return false
        selection.formatText("superscript")
        return true
    }

    #handleSub() {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return false
        selection.formatText("subscript")
        return true
    }

    initializeToolbar(lexxyToolbar) {
        const subButton  = document.createElement("button")
        subButton.className = "lexxy-editor__toolbar-button"
        subButton.setAttribute("type", "button")
        subButton.setAttribute("data-command", "setSubScript")
        subButton.innerHTML = "▼"

        lexxyToolbar.querySelector("button[name=bold]").insertAdjacentElement("afterend", subButton)

        const supButton  = document.createElement("button")
        supButton.className = "lexxy-editor__toolbar-button"
        supButton.setAttribute("type", "button")
        supButton.setAttribute("data-command", "setSuperScript")
        supButton.innerHTML = "▲"

        lexxyToolbar.querySelector("button[name=bold]").insertAdjacentElement("afterend", supButton)
    }
}

