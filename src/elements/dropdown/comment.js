import { ToolbarDropdown } from "../toolbar_dropdown.js"
import { $getSelection } from "lexical"

export class CommentDropdown extends ToolbarDropdown {

    connectedCallback() {
        super.connectedCallback()
        this.textarea = this.querySelector("textarea")
        this.#registerHandlers()
    }

    #registerHandlers() {
        this.addEventListener("submit", this.#handleSubmit.bind(this))
    }

    #handleSubmit(event) {
        this.editor.getEditorState().read(() => {
            const selection = $getSelection()
            if (selection.getTextContent() !== "") {
                const command = event.submitter?.value
                this.editor.dispatchCommand(command, this.textarea.value)
            }
        })
        this.close()
    }
}

customElements.define("lexxy-comment-dropdown", CommentDropdown)
