import { NodeInputProps } from "./helpers"
import TextInput from "./TextInput"

export const NodeInputDefault = function NodeInputDefault(props: NodeInputProps) {
  const { node, attributes, value = "", setValue, disabled } = props

  // Some attributes have dynamic JavaScript - this is for example required for WebAuthn.
  const onClick = () => {
    // This section is only used for WebAuthn. The script is loaded via a <script> node
    // and the functions are available on the global window level. Unfortunately, there
    // is currently no better way than executing eval / function here at this moment.
    if (attributes.onclick) {
      // eslint-disable-next-line no-new-func
      const run = new Function(attributes.onclick)
      run()
    }
  }

  // Render a generic text input field.
  return (
    <TextInput
      title={node.meta.label?.text}
      onClick={onClick}
      onChange={(event) => {
        setValue(event.target.value)
      }}
      type={attributes.type}
      name={attributes.name}
      value={value}
      disabled={attributes.disabled || disabled}
      state={node.messages.find(({ type }) => type === "error") ? "error" : undefined}
      subtitle={
        <>
          {node.messages.map(({ text, id }, index) => (
            <span key={`${id}-${index}`} data-testid={`ui/message/${id}`}>
              {text}
            </span>
          ))}
        </>
      }
    />
  )
}
