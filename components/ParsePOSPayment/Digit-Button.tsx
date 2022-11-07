import React from "react"

import { ACTIONS, ACTION_TYPE } from "../../pages/_reducer"

interface Props {
  digit: string
  dispatch: React.Dispatch<ACTION_TYPE>
}

function DigitButton({ digit, dispatch }: Props) {
  return (
    <button onClick={() => dispatch({ type: ACTIONS.ADD_DIGIT, payload: digit })}>
      {digit}
    </button>
  )
}

export default DigitButton
