import { translate } from "@galoymoney/client"
import { InvoiceInput } from "components/pages/send"

import SendIntraLedgerAction, {
  SendIntraLedgerActionProps,
} from "components/send/send-intra-ledger-action"
import {
  SendLnActionProps,
  SendLnInvoiceAction,
  SendLnNoAmountActionProps,
  SendLnNoAmountInvoiceAction,
} from "components/send/send-ln-action"
import SendOnChainAction, {
  SendOnChainActionProps,
} from "components/send/send-onchain-action"

export type SendActionProps = InvoiceInput & {
  btcWalletId: string
  btcWalletBalance: number
  reset: () => void
}

type FCT = React.FC<SendActionProps>

const SendAction: FCT = (props) => {
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
    (props.paymentType !== "intraledger" || props.recipientWalletId)

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
    return <SendIntraLedgerAction {...(props as SendIntraLedgerActionProps)} />
  }

  return <button disabled>{translate("Enter amount and destination")}</button>
}

export default SendAction
