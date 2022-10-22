import { useCallback } from "react"

import { translate, useAppDispatcher } from "store/index"
import useMainQuery from "hooks/use-main-query"

import { ButtonLink } from "components/link"

import SendIntraLedgerAction, {
  SendIntraLedgerActionProps,
} from "components/send/send-intra-ledger-action"
import SendIntraLedgerUsdAction, {
  SendIntraLedgerUsdActionProps,
} from "components/send/send-intra-ledger-usd-action"

import {
  SendLnActionProps,
  SendLnInvoiceAction,
  SendLnNoAmountActionProps,
  SendLnNoAmountInvoiceAction,
} from "components/send/send-ln-action"
import {
  SendLnUsdActionProps,
  SendLnUsdInvoiceAction,
  SendLnNoAmountUsdActionProps,
  SendLnNoAmountUsdInvoiceAction,
} from "components/send/send-ln-usd-action"

import SendOnChainAction, {
  SendOnChainActionProps,
} from "components/send/send-onchain-action"

import { SendScreenInput } from "components/pages/send"
import { Spinner } from "@galoymoney/react"
import { formatSats, formatUsd } from "@galoymoney/client"

export type SendActionProps = SendScreenInput & {
  btcWalletId: string
  usdWalletId: string | undefined
  reset: () => void
}

type FCT = React.FC<{
  children?: React.ReactNode
  input: SendScreenInput
}>

const SendAction: FCT = ({ children, input }) => {
  const dispatch = useAppDispatcher()
  const { btcWalletId, btcWalletBalance, usdWalletId, usdWalletBalance } = useMainQuery()

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

  if (
    input.fromWallet?.walletCurrency === "BTC" &&
    input.satAmount &&
    input.satAmount > btcWalletBalance
  ) {
    return (
      <div className="error">
        {translate("Payment amount exceeds balance of %{balance}", {
          balance: formatSats(btcWalletBalance),
        })}
      </div>
    )
  }

  if (
    input.fromWallet?.walletCurrency === "USD" &&
    input.usdAmount &&
    input.usdAmount > usdWalletBalance
  ) {
    return (
      <div className="error">
        {translate("Payment amount exceeds balance of %{balance}", {
          balance: formatUsd(usdWalletBalance),
        })}
      </div>
    )
  }

  if (children) {
    return <>{children}</>
  }

  const showSpinner = inputPending || satAmountPending

  if (showSpinner) {
    return <Spinner size="big" />
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
    usdWalletId,
    reset,
  }

  if (
    sendActionProps.paymentType === "lightning" &&
    input.fromWallet?.walletCurrency === "BTC"
  ) {
    return sendActionProps.fixedAmount ? (
      <SendLnInvoiceAction {...(sendActionProps as SendLnActionProps)} />
    ) : (
      <SendLnNoAmountInvoiceAction {...(sendActionProps as SendLnNoAmountActionProps)} />
    )
  }

  if (
    sendActionProps.paymentType === "lightning" &&
    input.fromWallet?.walletCurrency === "USD"
  ) {
    return sendActionProps.fixedAmount ? (
      <SendLnUsdInvoiceAction {...(sendActionProps as SendLnUsdActionProps)} />
    ) : (
      <SendLnNoAmountUsdInvoiceAction
        {...(sendActionProps as SendLnNoAmountUsdActionProps)}
      />
    )
  }

  if (sendActionProps.paymentType === "onchain") {
    return <SendOnChainAction {...(sendActionProps as SendOnChainActionProps)} />
  }

  if (
    sendActionProps.paymentType === "intraledger" &&
    input.fromWallet?.walletCurrency === "BTC"
  ) {
    return <SendIntraLedgerAction {...(sendActionProps as SendIntraLedgerActionProps)} />
  }

  if (
    sendActionProps.paymentType === "intraledger" &&
    input.fromWallet?.walletCurrency === "USD"
  ) {
    return (
      <SendIntraLedgerUsdAction {...(sendActionProps as SendIntraLedgerUsdActionProps)} />
    )
  }

  return <button disabled>{translate("Enter amount and destination")}</button>
}

export default SendAction
