import { useState } from "react"

import { translate } from "translate"

import FormattedNumberInput, { OnNumberValueChange } from "./formatted-number-input"
import Header from "./header"

const Send = () => {
  const [amount, setAmount] = useState<number | "">("")
  const handleAmountUpdate: OnNumberValueChange = (numberValue) => {
    setAmount(numberValue)
  }
  return (
    <div className="send">
      <Header />
      <div className="page-title">{translate("Send Bitcoin")}</div>

      <div className="amount-input">
        <FormattedNumberInput
          key={"wip"}
          value={amount.toString()}
          onChange={handleAmountUpdate}
        />
      </div>
    </div>
  )
}

export default Send
