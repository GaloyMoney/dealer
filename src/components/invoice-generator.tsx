import { useState, useEffect, useRef } from "react"
import { useMutation } from "@apollo/client"

import Spinner from "./spinner"
import { usdFormatter } from "store"
import { translate } from "translate"

import { LightningInvoice, OnChainInvoice } from "./invoice"
import { GaloyGQL, mutations } from "@galoymoney/client"
import { errorsText } from "store/graphql"

const INVOICE_EXPIRE_INTERVAL = 60 * 60 * 1000

type InvoiceProps = {
  layer: "lightning" | "onchain"
  btcWalletId: string
  btcAddress: GaloyGQL.Scalars["OnChainAddress"] | undefined
  regenerate: () => void
  amount: number | ""
  currency: string
  memo: string
  satAmount: number
  convertedUsdAmount: number
}

const ErrorMessage = () => (
  <div className="error">
    {translate("Not able to generate invoice.")}
    <br />
    {translate("Please try again later.")}
  </div>
)

const ExpiredMessage = ({ onClick }: { onClick: () => void }) => (
  <div className="invoice-message expired-invoice">
    {translate("Invoice Expired...")}{" "}
    <div className="link" onClick={onClick}>
      {translate("Generate New Invoice")}
    </div>
  </div>
)

const AmountInvoiceGenerator = ({
  btcWalletId,
  regenerate,
  amount,
  memo,
  currency,
  satAmount,
  convertedUsdAmount,
}: InvoiceProps) => {
  const [invoiceStatus, setInvoiceStatus] = useState<undefined | "new" | "expired">()

  const timerIds = useRef<number[]>([])

  const [createInvoice, { loading, error, data }] = useMutation<
    { lnInvoiceCreate: GaloyGQL.LnInvoicePayload },
    { input: GaloyGQL.LnInvoiceCreateInput }
  >(mutations.lnInvoiceCreate, {
    onError: console.error,
    onCompleted: () => setInvoiceStatus("new"),
  })

  const clearTimers = () => {
    timerIds.current.forEach((timerId) => clearTimeout(timerId))
  }

  useEffect(() => {
    createInvoice({
      variables: { input: { walletId: btcWalletId, amount: satAmount, memo } },
    })
    timerIds.current.push(
      window.setTimeout(() => setInvoiceStatus("expired"), INVOICE_EXPIRE_INTERVAL),
    )
    return clearTimers
  }, [satAmount, btcWalletId, createInvoice, currency, memo])

  let errorString: string | undefined = error?.message || undefined
  let invoice: GaloyGQL.Maybe<GaloyGQL.LnInvoice> | undefined = undefined

  if (data) {
    const invoiceData = data.lnInvoiceCreate
    if (invoiceData.errors?.length > 0) {
      errorString = errorsText(invoiceData)
    } else {
      invoice = invoiceData.invoice
    }
  }

  if (errorString) {
    return <ErrorMessage />
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

  const invoiceNeedUpdate = Boolean(
    currency === "USD" && amount && Math.abs(convertedUsdAmount - amount) / amount > 0.01,
  )

  return (
    <>
      {invoiceNeedUpdate && (
        <div className="invoice-message">
          {translate("Invoice value is now %{value}", {
            value: usdFormatter.format(convertedUsdAmount),
          })}
          <div className="link" onClick={regenerate}>
            {translate("Generate new invoice for %{amount}", {
              amount: usdFormatter.format(amount as number),
            })}
          </div>
        </div>
      )}
      <LightningInvoice invoice={invoice} onPaymentSuccess={clearTimers} />
    </>
  )
}

type NoInvoiceProps = {
  btcWalletId: string
  regenerate: () => void
  memo: string
}

const NoAmountInvoiceGenerator = ({ btcWalletId, regenerate, memo }: NoInvoiceProps) => {
  const [invoiceStatus, setInvoiceStatus] = useState<undefined | "new" | "expired">()

  const timerIds = useRef<number[]>([])

  const [createInvoice, { loading, error, data }] = useMutation<
    { lnNoAmountInvoiceCreate: GaloyGQL.LnNoAmountInvoicePayload },
    { input: GaloyGQL.LnNoAmountInvoiceCreateInput }
  >(mutations.lnNoAmountInvoiceCreate, {
    onError: console.error,
    onCompleted: () => setInvoiceStatus("new"),
  })

  const clearTimers = () => {
    timerIds.current.forEach((timerId) => clearTimeout(timerId))
  }

  useEffect(() => {
    createInvoice({
      variables: { input: { walletId: btcWalletId, memo } },
    })
    timerIds.current.push(
      window.setTimeout(() => setInvoiceStatus("expired"), INVOICE_EXPIRE_INTERVAL),
    )
    return clearTimers
  }, [btcWalletId, createInvoice, memo])

  let errorString: string | undefined = error?.message || undefined
  let invoice: GaloyGQL.Maybe<GaloyGQL.LnNoAmountInvoice> | undefined = undefined

  if (data) {
    const invoiceData = data.lnNoAmountInvoiceCreate
    if (invoiceData.errors?.length > 0) {
      errorString = errorsText(invoiceData)
    } else {
      invoice = invoiceData.invoice
    }
  }

  if (errorString) {
    console.error(errorString)
    return <ErrorMessage />
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

  return <LightningInvoice invoice={invoice} onPaymentSuccess={clearTimers} />
}

const InvoiceGenerator = (props: InvoiceProps) => {
  if (props.layer === "onchain" && props.btcAddress) {
    return (
      <OnChainInvoice
        btcAddress={props.btcAddress}
        satAmount={props.satAmount}
        memo={props.memo}
      />
    )
  }

  if (props.satAmount === 0) {
    return (
      <NoAmountInvoiceGenerator
        btcWalletId={props.btcWalletId}
        regenerate={props.regenerate}
        memo={props.memo}
      />
    )
  }

  return <AmountInvoiceGenerator {...props} />
}

export default InvoiceGenerator
