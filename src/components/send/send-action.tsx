import { useCallback } from "react"

import { translate, useAppDispatcher } from "store/index"
import useMainQuery from "hooks/use-main-query"

import { ButtonLink } from "components/link"
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
import { SendScreenInput } from "components/pages/send"
import { Spinner } from "@galoymoney/react"

export type SendActionProps = SendScreenInput & {
  btcWalletId: string
  btcWalletBalance: number
  reset: () => void
}

type FCT = React.FC<{ children?: React.ReactNode; input: SendScreenInput }>

const SendAction: FCT = ({ children, input }) => {
  const dispatch = useAppDispatcher()
  const { btcWalletId, btcWalletBalance } = useMainQuery()

  const reset = useCallback(() => {
    dispatch({ type: "navigate", path: "/send" })
  }, [dispatch])

  if (!btcWalletId) {
    return <ButtonLink to="/login">{translate("Login to send")}</ButtonLink>
  }

  if (input.errorMessage) {
    return <div className="error">{input.errorMessage}</div>
  }

  const inputPending =
    input.amount === undefined ||
    input.destination === undefined ||
    input.memo === undefined

  const satAmountPending =
    typeof input.amount === "number" && input.satAmount === undefined

  if (input.satAmount && input.satAmount > btcWalletBalance) {
    const errorMessage = translate("Payment amount exceeds balance of %{balance} sats", {
      balance: btcWalletBalance,
    })
    return <div className="error">{errorMessage}</div>
  }

  if (children) {
    return <>{children}</>
  }

  const showSpinner = inputPending || satAmountPending

  if (showSpinner) {
    return <Spinner size="big" />
  }

  if (input.satAmount && input.satAmount > btcWalletBalance) {
    return (
      <div className="error">
        {translate("Payment amount exceeds balance of %{balance} sats", {
          balance: btcWalletBalance,
        })}
      </div>
    )
  }

  const validInput =
    input.valid &&
    (input.fixedAmount || typeof input.amount === "number") &&
    (input.paymentType !== "intraledger" || input.recipientWalletId)

  if (!validInput) {
    return <button disabled>{translate("Enter amount and destination")}</button>
  }

  const sendActionProps = {
    ...input,
    btcWalletId,
    btcWalletBalance,
    reset,
  }

  if (sendActionProps.paymentType === "lightning") {
    return sendActionProps.fixedAmount ? (
      <SendLnInvoiceAction {...(sendActionProps as SendLnActionProps)} />
    ) : (
      <SendLnNoAmountInvoiceAction {...(sendActionProps as SendLnNoAmountActionProps)} />
    )
  }

  if (sendActionProps.paymentType === "onchain") {
    return <SendOnChainAction {...(sendActionProps as SendOnChainActionProps)} />
  }

  if (sendActionProps.paymentType === "intraledger") {
    return <SendIntraLedgerAction {...(sendActionProps as SendIntraLedgerActionProps)} />
  }

  return <button disabled>{translate("Enter amount and destination")}</button>
}

export default SendAction
