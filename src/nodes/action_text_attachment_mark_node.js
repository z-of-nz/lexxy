import { $applyNodeReplacement } from "lexical"
import { createElement } from "../helpers/html_helper"
import { MarkNode } from "@lexical/mark"
import { addClassNamesToElement } from "@lexical/utils"

/**
 * ActionTextAttachmentMarkNode
 *
 * References meta elements (like comments) in rich texts. The actual meta content is saved and
 * updated in a Rails backend. Uses Lexical's MarkNode to spread meta references over multiple
 * HTML nodes.
 *
 * Lifecycle attributes on the DOM element:
 *   data-selection-group  — groups the selection before Rails creates the record
 *   data-create-meta-content — triggers creation & storage of the meta content as an ActiveStorage blob
 *   data-delete-meta-content — triggers deletion of the referenced ActiveStorage blob
 *
 * After creation, sgid is used for identification. Updating meta content should be handled by the
 * host application.
 */
export class ActionTextAttachmentMarkNode extends MarkNode {

  constructor(ids = [], dataset = {}, sgid = null, key) {
    super(ids, key)
    this.__dataset = dataset || {
      createMetaContent: null,
      deleteMetaContent: null,
      selectionGroup: null
    }
    this.sgid = sgid
  }

  static getType() {
    return "action_text_attachment_mark_node"
  }

  static importJSON(serializedNode) {
    const node = new ActionTextAttachmentMarkNode(
      serializedNode.ids || [],
      serializedNode.dataset,
      serializedNode.sgid
    )
    return $applyNodeReplacement(node)
  }

  static importDOM() {
    return {
      "action-text-attachment-mark-node": (node) => ({
        conversion: (element) => {
          const dataset = {}
          if (element.getAttribute("data-create-meta-content") !== undefined) {
            dataset.createMetaContent = element.getAttribute("data-create-meta-content")
          }
          if (element.getAttribute("data-delete-meta-content") !== undefined) {
            dataset.deleteMetaContent = element.getAttribute("data-delete-meta-content")
          }
          if (element.getAttribute("data-selection-group") !== undefined) {
            dataset.selectionGroup = element.getAttribute("data-selection-group")
          }

          const sgid = element.getAttribute("sgid")
          const newNode = $createActionTextAttachmentMarkNode(dataset, sgid)

          return { node: newNode }
        },
        priority: 1
      })
    }
  }

  static clone(node) {
    return new ActionTextAttachmentMarkNode(node.__ids, node.__dataset, node.sgid, node.__key)
  }

  createDOM(config) {
    const element = createElement("action-text-attachment-mark-node", { sgid: this.sgid })
    addClassNamesToElement(element, config.theme.mark)
    this.setContentAttributes(element)
    if (this.__ids.length > 1) {
      addClassNamesToElement(element, config.theme.markOverlap)
    }
    return element
  }

  exportDOM() {
    const element = document.createElement("action-text-attachment-mark-node")
    if (this.sgid) {
      element.setAttribute("sgid", this.sgid)
    }
    this.setContentAttributes(element)
    element.setAttribute("content-type", "text/html; charset=utf-8")
    return { element }
  }

  setContentAttributes(element) {
    if (this.__dataset.createMetaContent) {
      element.setAttribute("data-create-meta-content", this.__dataset.createMetaContent)
    }
    if (this.__dataset.deleteMetaContent) {
      element.setAttribute("data-delete-meta-content", this.__dataset.deleteMetaContent)
    }
    if (this.__dataset.selectionGroup) {
      element.setAttribute("data-selection-group", this.__dataset.selectionGroup)
    }
  }

  updateDOM() {
    return false
  }

  isInline() {
    return true
  }

  canMergeWith(node) {
    if (!super.canMergeWith(node)) return false
    return node instanceof ActionTextAttachmentMarkNode &&
      this.sgid === node.sgid &&
      this.__dataset.selectionGroup === node.__dataset.selectionGroup
  }

  excludeFromCopy() {
    return false
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "action_text_attachment_mark_node",
      sgid: this.sgid,
      dataset: {
        createMetaContent: this.__dataset.createMetaContent,
        deleteMetaContent: this.__dataset.deleteMetaContent,
        selectionGroup: this.__dataset.selectionGroup,
      }
    }
  }
}

export function $createActionTextAttachmentMarkNode(dataset = {}, sgid = null) {
  return $applyNodeReplacement(new ActionTextAttachmentMarkNode([], dataset, sgid))
}
