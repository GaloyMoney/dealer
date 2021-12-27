import { useState } from "react"

import { translate } from "translate"

import FormattedInput from "./formatted-input"
import Header from "./header"

const Send = () => {
  const [amount, setAmount] = useState<number | "">("")
  const handleAmountUpdate: OnFormattedValueChangeFunction = ({ numberValue }) => {
    setAmount(numberValue)
  }
  return (
    <div className="send">
      <Header />
      <div className="page-title">{translate("Send Bitcoin")}</div>

      <div className="amount-input">
        <FormattedInput
          key={"wip"}
          value={amount.toString()}
          onValueChange={handleAmountUpdate}
        />
      </div>
    </div>
  )
}

export default Send
