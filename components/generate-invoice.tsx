import React, { useEffect, useRef } from "react"

import useCreateInvoice from "../hooks/use-Create-Invoice"
import Invoice from "./invoice"

const INVOICE_STALE_CHECK_INTERVAL = 2 * 60 * 1000
const INVOICE_EXPIRE_INTERVAL = 60 * 60 * 1000

function GenerateInvoice({
  recipientWalletId,
  recipientWalletCurrency,
  amountInBase,
  regenerate,
  currency,
}: {
  recipientWalletId: string
  recipientWalletCurrency: string
  amountInBase: number
  regenerate: () => void
  currency: string
}) {
  const { createInvoice, data, loading, errorsMessage, invoiceStatus, setInvoiceStatus } =
    useCreateInvoice({ recipientWalletCurrency })
  const timerIds = useRef<number[]>([])

  const clearAllTimers = () => {
    timerIds.current.forEach((timerId) => clearTimeout(timerId))
  }
  useEffect(() => {
    createInvoice({
      variables: {
        input: { recipientWalletId, amount: amountInBase },
      },
    })
    if (currency !== "SATS" || recipientWalletCurrency === "USD") {
      timerIds.current.push(
        window.setTimeout(
          () => setInvoiceStatus("need-update"),
          INVOICE_STALE_CHECK_INTERVAL,
        ),
      )
    }
    timerIds.current.push(
      window.setTimeout(() => setInvoiceStatus("expired"), INVOICE_EXPIRE_INTERVAL),
    )
    return clearAllTimers
  }, [recipientWalletId, amountInBase, currency, createInvoice])

  const errorString: string | null = errorsMessage || null
  let invoice

  if (data) {
    if ("lnInvoiceCreateOnBehalfOfRecipient" in data) {
      const { lnInvoiceCreateOnBehalfOfRecipient: invoiceData } = data
      if (invoiceData.invoice) {
        invoice = invoiceData.invoice
      }
    }
    if ("lnUsdInvoiceCreateOnBehalfOfRecipient" in data) {
      const { lnUsdInvoiceCreateOnBehalfOfRecipient: invoiceData } = data
      if (invoiceData.invoice) {
        invoice = invoiceData.invoice
      }
    }
  }

  if (errorString) {
    return <div className="error">{errorString}</div>
  }

  if (loading) {
    return <div className="loading">Creating Invoice...</div>
  }

  if (!invoice) return null

  if (invoiceStatus === "expired") {
    return (
      <div className="warning expired-invoice">
        Invoice Expired...{" "}
        <span className="clickable" onClick={regenerate}>
          Generate New Invoice
        </span>
      </div>
    )
  }

  return (
    <>
      {invoiceStatus === "need-update" && (
        <div className="warning">
          Stale Price...{" "}
          <span className="clickable" onClick={regenerate}>
            Regenerate Invoice
          </span>
        </div>
      )}
      <Invoice
        paymentRequest={invoice.paymentRequest}
        onPaymentSuccess={clearAllTimers}
      />
    </>
  )
}

export default GenerateInvoice
