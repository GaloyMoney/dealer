import * as React from "react"

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  subtitle?: React.ReactNode
  state?: "success" | "error" | "disabled"
}

const TextInput = ({
  className = "",
  title,
  subtitle,
  type = "text",
  ...props
}: TextInputProps) => {
  let state = props.state
  if (props.disabled) {
    state = "disabled"
  }

  return (
    <div className={`${className} input-container`}>
      {title && <div className={className}>{title}</div>}
      <input {...props} type={type} className={className} />
      {subtitle && <div className={`${className} ${state}-state`}>{subtitle}</div>}
    </div>
  )
}

export default TextInput
