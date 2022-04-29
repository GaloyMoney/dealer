import { NodeInputProps } from "components/kratos/helpers"

export const NodeInputHidden = function NodeInputHidden({ attributes }: NodeInputProps) {
  // Render a hidden input field
  return (
    <input
      type={attributes.type}
      name={attributes.name}
      value={attributes.value || "true"}
    />
  )
}
