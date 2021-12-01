import React, { useState, useEffect } from "react"
import { useDebouncedCallback } from "use-debounce"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"

import FormattedInput from "./formatted-input"
import useSatPrice from "../lib/use-sat-price"
import GenerateInvoice from "./generate-invoice"

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

const satsFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

export default function ReceiveAmount({ userWalletId }: { userWalletId: string }) {
  const router = useRouter()
  const { satsToUsd, usdToSats } = useSatPrice()
  const { amount, currency } = parseQueryAmount(router.query) // USD or SATs

  function toggleCurrency() {
    const newCurrency = currency === "SATS" ? "USD" : "SATS"
    const newAmount =
      newCurrency === "SATS" ? Math.round(usdToSats(amount)) : satsToUsd(amount)

    router.push(getUpdatedURL(router.query, { currency: newCurrency, amount: newAmount }))
  }

  const handleAmountUpdate = useDebouncedCallback(({ numberValue }) => {
    router.push(getUpdatedURL(router.query, { amount: numberValue }))
  }, 1000)

  function getSatsForInvoice() {
    return Math.round(currency === "SATS" ? amount : Math.round(usdToSats(amount)))
  }

  function triggerRegenerateInvoice() {
    setSatsForInvoice(0)
    setTimeout(() => {
      setSatsForInvoice(getSatsForInvoice())
    })
  }

  const [satsForInvoice, setSatsForInvoice] = useState(getSatsForInvoice())

  const convertedValue =
    currency === "SATS"
      ? usdFormatter.format(satsToUsd(amount))
      : satsFormatter.format(Math.round(usdToSats(amount))) + " sats"

  useEffect(() => {
    const newSats = getSatsForInvoice()
    if (newSats !== satsForInvoice) setSatsForInvoice(newSats)
  }, [amount, currency, usdToSats])

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

      {satsForInvoice > 0 && (
        <GenerateInvoice
          userWalletId={userWalletId}
          satsForInvoice={satsForInvoice}
          regenerate={triggerRegenerateInvoice}
          currency={currency}
        />
      )}
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
