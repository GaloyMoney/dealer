import { useState } from "react"

import { translate } from "translate"

import FormattedInput from "./formatted-input"
import Header from "./header"

const Receive = () => {
  const [amount, setAmount] = useState<number | "">("")
  const handleAmountUpdate: OnFormattedValueChangeFunction = ({ numberValue }) => {
    setAmount(numberValue)
  }
  return (
    <div className="receive">
      <Header />
      <div className="page-title">{translate("Receive Bitcoin")}</div>{" "}
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

export default Receive
