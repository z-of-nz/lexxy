import { ToolbarDropdown } from "../toolbar_dropdown"
import { $getSelection } from "lexical"
import { registerEventListener } from "../../helpers/listener_helper"
import { INSERT_COMMENT_MARK_COMMAND } from "../../extensions/commenting_extension"

export class CommentDropdown extends ToolbarDropdown {
  #textarea

  editorReady() {
    this.#textarea = this.panel.querySelector("textarea")
    this.track(registerEventListener(this.panel.querySelector("form"), "submit", this.#handleSubmit))
  }

  onOpen() {
    this.#textarea.value = ""
  }

  #handleSubmit = (event) => {
    event.preventDefault()

    this.editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (selection.getTextContent() !== "") {
        this.editor.dispatchCommand(INSERT_COMMENT_MARK_COMMAND, this.#textarea.value)
      }
    })

    this.close()
  }
}

export default CommentDropdown
