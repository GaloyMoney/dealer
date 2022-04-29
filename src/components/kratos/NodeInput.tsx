import { NodeInputButton } from "components/kratos/NodeInputButton"
import { NodeInputCheckbox } from "components/kratos/NodeInputCheckbox"
import { NodeInputDefault } from "components/kratos/NodeInputDefault"
import { NodeInputHidden } from "components/kratos/NodeInputHidden"
import { NodeInputSubmit } from "components/kratos/NodeInputSubmit"
import { NodeInputProps } from "components/kratos/helpers"

export const NodeInput = (props: NodeInputProps) => {
  const { attributes } = props

  switch (attributes.type) {
    case "hidden":
      // Render a hidden input field
      return <NodeInputHidden {...props} />
    case "checkbox":
      // Render a checkbox. We have one hidden element which is the real value (true/false), and one
      // display element which is the toggle value (true)!
      return <NodeInputCheckbox {...props} />
    case "button":
      // Render a button
      return <NodeInputButton {...props} />
    case "submit":
      // Render the submit button
      return <NodeInputSubmit {...props} />
  }

  // Render a generic text input field.
  return <NodeInputDefault {...props} />
}
