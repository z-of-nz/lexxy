import { ToolbarDropdown } from "../toolbar_dropdown"
import { $getSelection } from "lexical"
import { registerEventListener } from "../../helpers/listener_helper"

export class CommentDropdown extends ToolbarDropdown {
  initialize() {
    this.textarea = this.querySelector("textarea")
    this.track(registerEventListener(this, "submit", this.#handleSubmit.bind(this)))
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

export default CommentDropdown
