import { ReactNode } from "react"

type ButtonProps = {
  helper?: ReactNode
  className?: string
  [key: string]: unknown
}

const Button = ({ helper, className = "button-container", ...props }: ButtonProps) => (
  <div className={className}>
    <button className="button" {...props} />
    {helper && <span className="button-helper">{helper}</span>}
  </div>
)

export default Button
