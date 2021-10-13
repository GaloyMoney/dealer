import { useState } from "react"
import ReceiveAmountUSDCent from "./receiveAmountUSDCent"
import ReceiveAmountSats from "./receiveAmountSats"
import AmountInput from "./atoms/amountInput"

export default function ReceiveAmount({
  userWalletId,
  amount: amountParam,
  currency,
}: {
  userWalletId: string
  amount: number
  currency: string
}) {
  const [amount, setAmount] = useState(0)
  const callbackSatsAmount = (amount: number) => setAmount(amount)
  // if (amount !== 0) {
  //   return <></>
  // }
  switch (currency) {
    case "usdcent":
      return (
        <>
          <AmountInput callbackSatsAmount={callbackSatsAmount} />
          <ReceiveAmountUSDCent
            userWalletId={userWalletId}
            amount={amountParam}
            currency={currency}
          />
        </>
      )
    case "sats":
      return (
        <>
          <AmountInput callbackSatsAmount={callbackSatsAmount} />
          <ReceiveAmountSats userWalletId={userWalletId} amount={amountParam} />
        </>
      )
    default:
      return <>Unsupported</>
  }
}
