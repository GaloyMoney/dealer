import React, { useState, useEffect } from "react"
import { gql, useMutation } from "@apollo/client"
import { useDebouncedCallback } from "use-debounce"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"

import FormattedInput from "./formatted-input"
import useSatPrice from "../lib/use-sat-price"
import Invoice from "./invoice"

type OperationError = {
  message: string
}

type LnInvoiceObject = {
  paymentRequest: string
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

const satsFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

const LN_INVOICE_CREATE_ON_BEHALF_OF_RECIPIENT = gql`
  mutation lnInvoiceCreateOnBehalfOfRecipient($walletId: WalletId!, $amount: SatAmount!) {
    mutationData: lnInvoiceCreateOnBehalfOfRecipient(
      input: { recipientWalletId: $walletId, amount: $amount }
    ) {
      errors {
        message
      }
      invoice {
        paymentRequest
      }
    }
  }
`

const INVOICE_STALE_CHECK_INTERVAL = 5 * 60 * 1000
const INVOICE_EXPIRE_INTERVAL = 60 * 60 * 1000

export default function ReceiveAmount({ userWalletId }: { userWalletId: string }) {
  console.log("rendering receive-amount component")

  const router = useRouter()
  const { satsToUsd, usdToSats } = useSatPrice()
  const { amount, currency } = parseQueryAmount(router.query) // USD or SATs

  const [regenerateCounter, setRegenerateCounter] = useState(1)
  const [invoiceStatus, setInvoiceStatus] = useState<
    "loading" | "new" | "need-update" | "expired"
  >("loading")

  function toggleCurrency() {
    const newCurrency = currency === "SATS" ? "USD" : "SATS"
    const newAmount = newCurrency === "SATS" ? usdToSats(amount) : satsToUsd(amount)

    router.push(getUpdatedURL(router.query, { currency: newCurrency, amount: newAmount }))
  }

  const handleAmountUpdate = useDebouncedCallback(({ numberValue }) => {
    router.push(getUpdatedURL(router.query, { amount: numberValue }))
  }, 1000)

  const satsForInvoice = currency === "SATS" ? amount : Math.round(usdToSats(amount))
  const convertedValue =
    currency === "SATS"
      ? usdFormatter.format(satsToUsd(amount))
      : satsFormatter.format(usdToSats(amount)) + " sats"

  const [createInvoice, { loading, error, data }] = useMutation<{
    mutationData: {
      errors: OperationError[]
      invoice?: LnInvoiceObject
    }
  }>(LN_INVOICE_CREATE_ON_BEHALF_OF_RECIPIENT, {
    onError: console.error,
    onCompleted: () => setInvoiceStatus("new"),
  })

  let errorString: string | null = error?.message || null
  let invoice
  if (data) {
    const invoiceData = data.mutationData
    if (invoiceData.errors?.length > 0) {
      errorString = invoiceData.errors.map((e) => e.message).join(", ")
    } else {
      invoice = invoiceData.invoice
    }
  }

  useEffect(() => {
    if (!satsForInvoice) return

    console.log("generating invoice", satsForInvoice)

    createInvoice({
      variables: { walletId: userWalletId, amount: satsForInvoice },
    })
    const invoiceNeedUpdateTimer = setTimeout(
      () => setInvoiceStatus("need-update"),
      INVOICE_STALE_CHECK_INTERVAL,
    )
    const invoiceExpiredTimer = setTimeout(
      () => setInvoiceStatus("expired"),
      INVOICE_EXPIRE_INTERVAL,
    )
    return () => {
      clearTimeout(invoiceNeedUpdateTimer)
      clearTimeout(invoiceExpiredTimer)
    }
  }, [userWalletId, satsForInvoice, createInvoice, regenerateCounter])

  return (
    <>
      <div className="amount-input">
        <div className="currency-label">{currency === "SATS" ? "sats" : "$"}</div>
        <div className="input-container">
          <FormattedInput
            key={currency}
            value={amount.toString()}
            onValueChange={handleAmountUpdate}
          />
        </div>
        <div className="toggle-currency" onClick={toggleCurrency}>
          &#8645;
        </div>
      </div>
      <div>&#8776; {convertedValue}</div>

      {satsForInvoice > 0 &&
        (errorString ? (
          <div className="error">{errorString}</div>
        ) : loading ? (
          <div className="loading">{loading && "Creating Invoice"}...</div>
        ) : !data ? null : (
          <>
            {invoiceStatus === "need-update" && (
              <div className="warning">
                Stale Price...{" "}
                <span
                  className="clickable"
                  onClick={() => setRegenerateCounter(regenerateCounter + 1)}
                >
                  Regenerate Invoice
                </span>
              </div>
            )}
            {invoiceStatus === "expired" ? (
              <div className="warning expired-invoice">
                Invoice Expired...{" "}
                <span
                  className="clickable"
                  onClick={() => setRegenerateCounter(regenerateCounter + 1)}
                >
                  Generate New Invoice
                </span>
              </div>
            ) : invoiceStatus === "new" && invoice ? (
              <Invoice paymentRequest={invoice.paymentRequest} />
            ) : null}
          </>
        ))}
    </>
  )
}

function parseQueryAmount(query: ParsedUrlQuery) {
  const currency = query.currency as string | null

  return {
    amount: Number(query.amount) || 0,
    currency: currency?.toUpperCase() || "USD",
  }
}

function getUpdatedURL(query: ParsedUrlQuery, update: Record<string, any>): string {
  const { username, ...params } = query

  const newEntries = Object.entries(params)
  const stringEntries = (newEntries || []).map(([k, v]) => [k, v?.toString()])
  const qs = new URLSearchParams(Object.fromEntries(stringEntries))

  Object.entries(update).forEach(([k, v]) => {
    qs.set(k, v)
  })

  return `/${username}?${qs.toString()}`
}
