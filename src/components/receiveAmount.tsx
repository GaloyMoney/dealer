import * as React from "react"
import debounce from "lodash.debounce"

import GenerateInvoice from "./generate-invoice"
import useSatPrice from "../helpers/use-sat-price"
import FormattedInput from "./formatted-input"

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

const satsFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

const parseQueryAmount = (queryObject: Record<string, string>) => {
  return {
    amount: Number(queryObject?.amount) || 0,
    currency: queryObject?.currency?.toUpperCase() || "USD",
  }
}

export default function ReceiveAmount({
  userWalletId,
  updateURLAmount,
}: {
  userWalletId: string
  updateURLAmount: ({ amount, currency }: { amount: number; currency: string }) => void
}) {
  const { satsToUsd, usdToSats } = useSatPrice()
  const [satsForInvoice, setSatsForInvoice] = React.useState(0)

  const urlSearchParams = new URLSearchParams(window.location.search)
  const params = Object.fromEntries(urlSearchParams.entries())
  const { amount, currency } = parseQueryAmount(params) // USD or SATs

  const [primaryAmount, setPrimaryAmount] = React.useState({
    amount,
    currency,
  })

  const { amount: primaryValue, currency: primaryCurrency } = primaryAmount

  const convertValue = React.useCallback(
    (value: number): string => {
      const newValue = primaryCurrency === "SATS" ? satsToUsd(value) : usdToSats(value)
      if (Number.isNaN(newValue)) {
        return "??" // Not parsable
      }
      return primaryCurrency === "SATS"
        ? usdFormatter.format(newValue)
        : satsFormatter.format(newValue) + " sats"
    },
    [primaryCurrency, satsToUsd, usdToSats],
  )

  const [convertedValue, setConvertedValue] = React.useState(() =>
    convertValue(primaryValue),
  )

  React.useEffect(() => {
    setConvertedValue(convertValue(primaryValue))
  }, [convertValue, primaryValue])

  const onAmountUpdateDebounced = React.useMemo(
    () =>
      debounce(({ satsForInvoice, amount, currency }) => {
        if (satsForInvoice > 0) {
          updateURLAmount({ amount, currency })
          setSatsForInvoice(satsForInvoice)
        }
      }, 1000),
    [updateURLAmount],
  )

  React.useEffect(() => {
    onAmountUpdateDebounced({
      satsForInvoice:
        primaryCurrency === "SATS" ? primaryValue : Math.round(usdToSats(primaryValue)),
      amount: primaryValue,
      currency: primaryCurrency,
    })
  }, [onAmountUpdateDebounced, primaryCurrency, primaryValue, usdToSats])

  const onFormattedInputValueChange: ({
    numberValue,
    formattedValue,
  }: {
    numberValue: number
    formattedValue: string
  }) => void = React.useCallback(({ numberValue }) => {
    setPrimaryAmount((currentAmount) => {
      return {
        amount: numberValue,
        currency: currentAmount.currency,
      }
    })
  }, [])

  const toggleCurrency = () => {
    setPrimaryAmount((currentAmount) => {
      const newPrimaryNumber: number =
        currentAmount.currency === "SATS"
          ? satsToUsd(currentAmount.amount)
          : usdToSats(currentAmount.amount)
      return {
        amount: Number(
          newPrimaryNumber.toFixed(currentAmount.currency === "SATS" ? 2 : 0),
        ),
        currency: currentAmount.currency === "SATS" ? "USD" : "SATS",
      }
    })
  }

  return (
    <>
      <div className="amount-input">
        <div className="currency-label">{primaryCurrency === "SATS" ? "sats" : "$"}</div>
        <div className="input-container">
          <FormattedInput
            key={primaryCurrency}
            value={primaryValue.toString()}
            onValueChange={onFormattedInputValueChange}
          />
        </div>
        <div className="toggle-currency" onClick={toggleCurrency}>
          &#8645;
        </div>
      </div>
      <p>&#8776; {convertedValue}</p>

      {satsForInvoice > 0 && (
        <GenerateInvoice amountInSats={satsForInvoice} userWalletId={userWalletId} />
      )}
    </>
  )
}
