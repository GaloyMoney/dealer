import React from "react"

import { ACTIONS, ACTION_TYPE } from "../../pages/_reducer"

interface Props {
  digit: string
  disabled?: boolean
  dispatch: React.Dispatch<ACTION_TYPE>
}

function DigitButton({ digit, disabled, dispatch }: Props) {
  return (
    <button
      disabled={disabled}
      onClick={() => dispatch({ type: ACTIONS.ADD_DIGIT, payload: digit })}
    >
      {digit}
    </button>
  )
}

export default DigitButton
