import {
  isUiNodeAnchorAttributes,
  isUiNodeImageAttributes,
  isUiNodeInputAttributes,
  isUiNodeScriptAttributes,
  isUiNodeTextAttributes,
} from "@ory/integrations/ui"
import { UiNode } from "@ory/kratos-client"

import { NodeAnchor } from "components/kratos/NodeAnchor"
import { NodeImage } from "components/kratos/NodeImage"
import { NodeInput } from "components/kratos/NodeInput"
import { NodeScript } from "components/kratos/NodeScript"
import { NodeText } from "components/kratos/NodeText"
import { FormDispatcher, ValueSetter } from "components/kratos/helpers"

interface Props {
  node: UiNode
  disabled: boolean
  value: number | string | string[] | undefined
  setValue: ValueSetter
  dispatchSubmit: FormDispatcher
}

export const Node = ({ node, value, setValue, disabled, dispatchSubmit }: Props) => {
  if (isUiNodeImageAttributes(node.attributes)) {
    return <NodeImage node={node} attributes={node.attributes} />
  }

  if (isUiNodeScriptAttributes(node.attributes)) {
    return <NodeScript node={node} attributes={node.attributes} />
  }

  if (isUiNodeTextAttributes(node.attributes)) {
    return <NodeText node={node} attributes={node.attributes} />
  }

  if (isUiNodeAnchorAttributes(node.attributes)) {
    return <NodeAnchor node={node} attributes={node.attributes} />
  }

  if (isUiNodeInputAttributes(node.attributes)) {
    return (
      <NodeInput
        dispatchSubmit={dispatchSubmit}
        value={value}
        setValue={setValue}
        node={node}
        disabled={disabled}
        attributes={node.attributes}
      />
    )
  }

  return null
}
