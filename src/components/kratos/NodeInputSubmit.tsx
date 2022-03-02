import { getNodeLabel } from "@ory/integrations/ui"
import { ReactNode } from "react"
import { NodeInputProps } from "./helpers"

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

export const NodeInputSubmit = ({
  node,
  attributes,
  setValue,
  disabled,
  dispatchSubmit,
}: NodeInputProps) => {
  return (
    <>
      <Button
        name={attributes.name}
        onClick={(event: React.MouseEvent<HTMLElement>) => {
          // On click, we set this value, and once set, dispatch the submission!
          setValue(attributes.value).then(() => dispatchSubmit(event))
        }}
        value={attributes.value || ""}
        disabled={attributes.disabled || disabled}
      >
        {getNodeLabel(node)}
      </Button>
    </>
  )
}
