import { $getRoot, $getSelection, $isElementNode, $isRangeSelection, COMMAND_PRIORITY_NORMAL, createCommand, defineExtension, mergeRegister } from "lexical"
import { $wrapSelectionInMarkNode } from "@lexical/mark"
import LexxyExtension from "./lexxy_extension"
import { dispatch } from "../helpers/html_helper"
import { registerEventListener } from "../helpers/listener_helper"
import { ActionTextAttachmentMarkNode } from "../nodes/action_text_attachment_mark_node"

export const INSERT_COMMENT_MARK_COMMAND = createCommand()

export class CommentingExtension extends LexxyExtension {
  get enabled() {
    return this.editorElement.supportsRichText
  }

  get lexicalExtension() {
    return defineExtension({
      name: "nz/commenting",
      register: (editor) => mergeRegister(
        editor.registerCommand(INSERT_COMMENT_MARK_COMMAND, this.#handleInsertComment.bind(this), COMMAND_PRIORITY_NORMAL),
        registerEventListener(this.editorElement, "lexxy:deleteCommentMark", this.#handleDeleteComment.bind(this))
      )
    })
  }

  initializeToolbar(lexxyToolbar) {
    const dividerButton = lexxyToolbar.querySelector("button[name=divider]")

    const dropdown = document.createElement("lexxy-comment-dropdown")
    dropdown.className = "lexxy-editor__toolbar-dropdown lexxy-editor__toolbar-dropdown--comment"

    const trigger = document.createElement("button")
    trigger.dataset.dropdownTrigger = ""
    trigger.className = "lexxy-editor__toolbar-button"
    trigger.type = "button"
    trigger.name = "comment"
    trigger.title = "Comment"
    trigger.dataset.hotkey = "cmd+q ctrl+q"
    trigger.setAttribute("aria-haspopup", "dialog")
    trigger.setAttribute("aria-expanded", "false")
    trigger.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M24,6.014c0,-1.966 -1.391,-3.563 -3.104,-3.563l-17.792,0c-1.713,0 -3.104,1.597 -3.104,3.563l0,7.125c0,1.966 1.391,3.562 3.104,3.562l4.696,0l-3,6.107l10.306,-6.107l5.79,0c1.713,0 3.104,-1.596 3.104,-3.562l0,-7.125Z"/>
      </svg>
    `

    const panel = document.createElement("div")
    panel.dataset.dropdownPanel = ""
    panel.setAttribute("role", "dialog")
    panel.setAttribute("aria-label", "Comment")
    panel.hidden = true

    const form = document.createElement("form")
    form.method = "dialog"

    const textarea = document.createElement("textarea")
    textarea.rows = 10
    textarea.placeholder = "Kommentar..."
    textarea.className = "input"
    textarea.required = true

    const actions = document.createElement("div")
    actions.className = "lexxy-editor__toolbar-dropdown-actions"

    const saveButton = document.createElement("button")
    saveButton.type = "submit"
    saveButton.className = "btn"
    saveButton.textContent = "Kommentieren"

    actions.append(saveButton)
    form.append(textarea, actions)
    panel.append(form)
    dropdown.append(trigger, panel)

    dividerButton.insertAdjacentElement("afterend", dropdown)
  }

  #handleInsertComment(metaContent) {
    this.editorElement.editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const selectionGroupId = [ ...Array(8) ].map(() => Math.floor(Math.random() * 16).toString(16)).join("")
      const isBackward = selection.isBackward()
      let i = 0
      $wrapSelectionInMarkNode(selection, isBackward, "", () => {
        const dataset = { selectionGroup: selectionGroupId }
        if (i === 0) { dataset.createMetaContent = metaContent; i++ }
        return new ActionTextAttachmentMarkNode([], dataset)
      })
      dispatch(this.editorElement, "lexxy:addMarkNodeOnSelection", { selectionGroupId })
    })
    return true
  }

  #handleDeleteComment(event) {
    const sgid = event.detail.sgid
    this.editorElement.editor.update(() => {
      function traverse(node) {
        if (node.getType() === "action_text_attachment_mark_node" && node.sgid && node.sgid === sgid) {
          node.getWritable().__dataset.deleteMetaContent = true
        }
        if ($isElementNode(node)) {
          node.getChildren().forEach(traverse)
        }
      }
      traverse($getRoot())
    })
  }
}
