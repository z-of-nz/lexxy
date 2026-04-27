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
        const editor = this.editorElement.editor
        const boldButton = lexxyToolbar.querySelector("button[name=bold]")
        boldButton.insertAdjacentElement("afterend", this.#createButton("▼", SET_SUB_SCRIPT_COMMAND, editor))
        boldButton.insertAdjacentElement("afterend", this.#createButton("▲", SET_SUP_SCRIPT_COMMAND, editor))
    }

    #createButton(label, command, editor) {
        const button = document.createElement("button")
        button.className = "lexxy-editor__toolbar-button"
        button.type = "button"
        button.textContent = label
        button.addEventListener("mousedown", (event) => {
            event.preventDefault()
            editor.dispatchCommand(command, undefined)
        })
        return button
    }
}

