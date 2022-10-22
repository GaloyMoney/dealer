import { useState, useEffect, useRef } from "react"

import {
  decodeInvoiceString,
  formatUsd,
  GaloyGQL,
  getLightningInvoiceExpiryTime,
  useMutation,
} from "@galoymoney/client"
import { SatFormat, Spinner, useCountdownTimer } from "@galoymoney/react"

import { translate } from "store/index"

import { LightningInvoice, OnChainInvoice } from "components/receive/invoice-details"
import ErrorMessage from "components/error-message"

const INVOICE_EXPIRE_INTERVAL = 60 * 60 * 1000

type ExpiredMessageFCT = React.FC<{ onClick: () => void }>

const ExpiredMessage: ExpiredMessageFCT = ({ onClick }) => (
  <div className="invoice-message expired-invoice">
    {translate("Invoice Expired")}{" "}
    <div className="link" onClick={onClick}>
      {translate("Generate New Invoice")}
    </div>
  </div>
)

type AmountInvoiceFCT = React.FC<{
  layer: "lightning" | "onchain"
  wallet: GaloyGQL.Wallet
  btcAddress: GaloyGQL.Scalars["OnChainAddress"] | undefined
  regenerate: () => void
  amount: number | ""
  currency: string
  memo: string
  satAmount: number
  usdAmount: number
  onPaymentSuccess: () => void
}>

const BtcAmountInvoiceGenerator: AmountInvoiceFCT = ({
  wallet,
  regenerate,
  amount,
  memo,
  currency,
  satAmount,
  usdAmount,
  onPaymentSuccess,
}) => {
  const [invoiceStatus, setInvoiceStatus] = useState<undefined | "new" | "expired">()

  const timerIds = useRef<number[]>([])

  const [createInvoice, { loading, errorsMessage, data }] = useMutation.lnInvoiceCreate({
    onCompleted: () => setInvoiceStatus("new"),
  })

  const clearTimers = () => {
    timerIds.current.forEach((timerId) => clearTimeout(timerId))
  }

  useEffect(() => {
    createInvoice({
      variables: { input: { walletId: wallet.id, amount: satAmount, memo } },
    })
    timerIds.current.push(
      window.setTimeout(() => setInvoiceStatus("expired"), INVOICE_EXPIRE_INTERVAL),
    )
    return clearTimers
  }, [satAmount, wallet.id, createInvoice, currency, memo])

  if (errorsMessage) {
    return <ErrorMessage message={errorsMessage} />
  }

  if (loading) {
    return <Spinner size="big" />
  }

  const invoice = data?.lnInvoiceCreate?.invoice

  if (!invoice) {
    return null
  }

  if (invoiceStatus === "expired") {
    return <ExpiredMessage onClick={regenerate} />
  }

  const invoiceNeedUpdate = Boolean(
    currency === "USD" && amount && Math.abs(usdAmount - amount) / amount > 0.01,
  )

  return (
    <>
      {invoiceNeedUpdate && (
        <div className="invoice-message">
          {translate("Invoice value is now %{value}", {
            value: formatUsd(usdAmount),
          })}
          <div className="link" onClick={regenerate}>
            {translate("Generate new invoice for %{amount}", {
              amount: formatUsd(amount as number),
            })}
          </div>
        </div>
      )}
      <LightningInvoice invoice={invoice} onPaymentSuccess={onPaymentSuccess} />
      <div className="amount-description">
        <div className="amount-primarys">
          <SatFormat amount={satAmount} />
        </div>
        <div className="amount-seconddary small">&#8776; {formatUsd(usdAmount)}</div>
      </div>
    </>
  )
}

const UsdAmountInvoiceGenerator: AmountInvoiceFCT = ({
  wallet,
  regenerate,
  memo,
  usdAmount,
  onPaymentSuccess,
}) => {
  const [invoiceStatus, setInvoiceStatus] = useState<undefined | "new" | "expired">()

  const { timeLeft, startCountdownTimer, stopCountdownTimer } = useCountdownTimer()

  const [createInvoice, { loading, errorsMessage, data }] =
    useMutation.lnUsdInvoiceCreate({
      onCompleted: () => setInvoiceStatus("new"),
    })

  useEffect(() => {
    createInvoice({
      variables: { input: { walletId: wallet.id, amount: 100 * usdAmount, memo } },
    })

    return () => stopCountdownTimer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createInvoice, memo, usdAmount, wallet.id])

  const invoice = data?.lnUsdInvoiceCreate?.invoice

  useEffect(() => {
    if (invoice) {
      const timeUntilInvoiceExpires =
        getLightningInvoiceExpiryTime(decodeInvoiceString(invoice.paymentRequest)) -
        Math.round(Date.now() / 1000)
      if (timeUntilInvoiceExpires <= 0) {
        setInvoiceStatus("expired")
        stopCountdownTimer()
        return
      }
      startCountdownTimer(timeUntilInvoiceExpires, () => setInvoiceStatus("expired"))
      return () => stopCountdownTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice])

  if (errorsMessage) {
    return <ErrorMessage message={errorsMessage} />
  }

  if (loading) {
    return <Spinner size="big" />
  }

  if (!invoice) {
    return null
  }

  if (invoiceStatus === "expired") {
    return <ExpiredMessage onClick={regenerate} />
  }

  return (
    <>
      <LightningInvoice invoice={invoice} onPaymentSuccess={onPaymentSuccess} />
      <div className="amount-description">
        <div className="amount-primary">{formatUsd(usdAmount)}</div>
      </div>

      {timeLeft !== undefined && (
        <div className="countdown-timer">
          <div style={timeLeft < 10 ? { color: "red" } : undefined}>
            {translate("Expires In")}:{" "}
            {new Date(timeLeft * 1000).toISOString().substring(14, 19)}
          </div>
        </div>
      )}
    </>
  )
}

type NoAmountInvoiceFCT = React.FC<{
  wallet: GaloyGQL.Wallet
  regenerate: () => void
  memo: string
  onPaymentSuccess: () => void
}>

const NoAmountInvoiceGenerator: NoAmountInvoiceFCT = ({
  wallet,
  regenerate,
  memo,
  onPaymentSuccess,
}) => {
  const [invoiceStatus, setInvoiceStatus] = useState<undefined | "new" | "expired">()

  const timerIds = useRef<number[]>([])

  const [createInvoice, { loading, errorsMessage, data }] =
    useMutation.lnNoAmountInvoiceCreate({
      onCompleted: () => setInvoiceStatus("new"),
    })

  const clearTimers = () => {
    timerIds.current.forEach((timerId) => clearTimeout(timerId))
  }

  useEffect(() => {
    createInvoice({
      variables: { input: { walletId: wallet.id, memo } },
    })
    timerIds.current.push(
      window.setTimeout(() => setInvoiceStatus("expired"), INVOICE_EXPIRE_INTERVAL),
    )
    return clearTimers
  }, [wallet.id, createInvoice, memo])

  if (errorsMessage) {
    return <ErrorMessage message={errorsMessage} />
  }

  if (loading) {
    return <Spinner size="big" />
  }

  const invoice = data?.lnNoAmountInvoiceCreate?.invoice

  if (!invoice) {
    return null
  }

  if (invoiceStatus === "expired") {
    return <ExpiredMessage onClick={regenerate} />
  }

  return (
    <>
      <LightningInvoice invoice={invoice} onPaymentSuccess={onPaymentSuccess} />
      <div className="amount-description">{translate("Flexible Amount Invoice")}</div>
    </>
  )
}

const InvoiceGenerator: AmountInvoiceFCT = (props) => {
  if (props.layer === "onchain" && props.btcAddress) {
    return (
      <OnChainInvoice
        btcAddress={props.btcAddress}
        satAmount={props.satAmount}
        usdAmount={props.usdAmount}
        memo={props.memo}
      />
    )
  }

  if (props.satAmount === 0) {
    return (
      <NoAmountInvoiceGenerator
        wallet={props.wallet}
        regenerate={props.regenerate}
        memo={props.memo}
        onPaymentSuccess={props.onPaymentSuccess}
      />
    )
  }

  if (props.wallet.walletCurrency === "BTC") {
    return <BtcAmountInvoiceGenerator {...props} />
  }

  if (props.wallet.walletCurrency === "USD") {
    return <UsdAmountInvoiceGenerator {...props} />
  }

  throw new Error("Invalid invoice data")
}

export default InvoiceGenerator
