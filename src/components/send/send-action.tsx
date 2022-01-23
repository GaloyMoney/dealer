import { translate } from "translate"
import SendIntraLedgerAction from "./send-intra-ledger-action"
import { SendLnInvoiceAction, SendLnNoAmountInvoiceAction } from "./send-ln-action"
import SendOnChainAction from "./send-onchain-action"

const SendAction = (props: SendActionProps) => {
  let { errorMessage } = props

  if (props.satAmount && props.satAmount > props.btcWalletBalance) {
    errorMessage = translate("Payment amount exceeds balance of %{balance} sats", {
      balance: props.btcWalletBalance,
    })
  }

  if (errorMessage) {
    return <div className="error">{errorMessage}</div>
  }

  const validInput =
    props.valid &&
    (props.fixedAmount || typeof props.amount === "number") &&
    (props.paymentType !== "intraledger" || props.reciepientWalletId)

  if (!validInput) {
    return <button disabled>{translate("Enter amount and destination")}</button>
  }

  if (props.paymentType === "lightning") {
    return props.fixedAmount ? (
      <SendLnInvoiceAction {...(props as SendLnActionProps)} />
    ) : (
      <SendLnNoAmountInvoiceAction {...(props as SendLnNoAmountActionProps)} />
    )
  }

  if (props.paymentType === "onchain") {
    return <SendOnChainAction {...(props as SendOnChainActionProps)} />
  }

  if (props.paymentType === "intraledger") {
    return <SendIntraLedgerAction {...props} />
  }

  return <button disabled>{translate("Enter amount and destination")}</button>
}

export default SendAction
