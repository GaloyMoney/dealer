import { useCallback, useEffect, useMemo, useState } from "react"
import { satsFormatter, usdFormatter } from "store"
import useMainQuery from "store/use-main-query"
import { useMyUpdates } from "store/use-my-updates"

import { translate } from "translate"

import FormattedNumberInput, { OnNumberValueChange } from "./formatted-number-input"
import InvoiceGenerator from "./invoice-generator"
import Header from "./header"
import SatSymbol from "./sat-symbol"
import Spinner from "./spinner"
import DebouncedTextarea, { OnTextValueChange } from "./debounced-textarea"
import { useMutation } from "@apollo/client"
import { GaloyGQL, mutations } from "@galoymoney/client"

type InvoiceInputState = {
  layer: "lightning" | "onchain"
  currency: "USD" | "SATS"
  amount: number | ""
  debouncedAmount?: number | ""
  memo: string
  satsForInvoice?: number
}

const Receive = () => {
  const { btcWalletId } = useMainQuery()

  const { satsToUsd, usdToSats } = useMyUpdates()

  const [input, setInput] = useState<InvoiceInputState>({
    layer: "lightning",
    currency: "USD",
    amount: "",
    memo: "",
  })

  const [generateBtcAddress, { loading, error, data }] = useMutation<
    { onChainAddressCurrent: GaloyGQL.OnChainAddressPayload },
    { input: GaloyGQL.OnChainAddressCreateInput }
  >(mutations.onChainAddressCurrent, {
    onError: console.error,
  })

  const shouldUpdateSatsForInvoice =
    Number.isNaN(input.satsForInvoice) &&
    typeof input.debouncedAmount === "number" &&
    !Number.isNaN(input.debouncedAmount)

  useEffect(() => {
    if (usdToSats && input.currency === "USD" && shouldUpdateSatsForInvoice) {
      setInput((currInput) => ({
        ...currInput,
        satsForInvoice: Math.round(usdToSats(input.debouncedAmount as number)),
      }))
    }
  }, [input.currency, input.debouncedAmount, shouldUpdateSatsForInvoice, usdToSats])

  useEffect(() => {
    if (input.currency === "SATS" && shouldUpdateSatsForInvoice) {
      setInput((currInput) => ({
        ...currInput,
        satsForInvoice: input.debouncedAmount as number,
      }))
    }
  }, [input.currency, input.debouncedAmount, shouldUpdateSatsForInvoice])

  useEffect(() => {
    if (input.layer === "onchain" && btcWalletId) {
      // Layer switched to onchain, generate a btc address
      generateBtcAddress({
        variables: {
          input: {
            walletId: btcWalletId,
          },
        },
      })
    }
  }, [btcWalletId, generateBtcAddress, input.layer])

  const onChainAddressErrrors = data?.onChainAddressCurrent?.errors

  if (error || (onChainAddressErrrors && onChainAddressErrrors?.length > 0)) {
    console.error(error || onChainAddressErrrors)
  }

  const btcAddress = data?.onChainAddressCurrent?.address ?? undefined

  const handleAmountUpdate: OnNumberValueChange = useCallback((numberValue) => {
    setInput((currInput) => ({
      ...currInput,
      amount: numberValue,
      satsForInvoice: NaN,
      debouncedAmount: NaN,
    }))
  }, [])

  const handleDebouncedAmountUpdate: OnNumberValueChange = useCallback(
    (debouncedAmount) => {
      setInput((currInput) => ({ ...currInput, debouncedAmount }))
    },
    [],
  )

  const handleDebouncedMemoUpdate: OnTextValueChange = useCallback((debouncedMemo) => {
    setInput((currInput) => ({ ...currInput, memo: debouncedMemo }))
  }, [])

  const toggleCurrency = useCallback(() => {
    if (!satsToUsd) {
      // Handle Price Error
      return
    }
    setInput((currInput) => {
      const newCurrency = currInput.currency === "SATS" ? "USD" : "SATS"
      let newAmount: number | "" = ""

      if (currInput.currency === "SATS" && currInput.amount) {
        newAmount = satsToUsd(currInput.amount)
      }

      if (currInput.currency === "USD" && currInput.satsForInvoice) {
        newAmount = currInput.satsForInvoice
      }

      return {
        ...currInput,
        currency: newCurrency,
        amount: newAmount,
        debouncedAmount: newAmount,
      }
    })
  }, [satsToUsd])

  const regenerateInvoice = useCallback(() => {
    setInput((currInput) => ({ ...currInput, satsForInvoice: NaN }))
  }, [])

  const toggleLayer = useCallback(() => {
    setInput((currInput) => ({
      ...currInput,
      layer: currInput.layer === "lightning" ? "onchain" : "lightning",
    }))
  }, [])

  const convertedValues = useMemo(() => {
    if (!usdToSats || !satsToUsd || !input.amount) {
      return null
    }

    if (input.currency === "SATS") {
      return {
        usd: satsToUsd(input.amount),
      }
    }

    const satsForConversion = input.satsForInvoice || usdToSats(input.amount)

    return {
      sats: satsForConversion,
      usd: satsToUsd(satsForConversion),
    }
  }, [input.amount, input.currency, input.satsForInvoice, satsToUsd, usdToSats])

  const conversionDisplay = useMemo(() => {
    if (!convertedValues) {
      return null
    }

    if (!convertedValues.sats) {
      return (
        <div className="converted-usd">
          &#8776; {usdFormatter.format(convertedValues.usd)}
        </div>
      )
    }

    return (
      <>
        <div className="converted-sats">
          <SatSymbol />
          {satsFormatter.format(convertedValues.sats)}
        </div>
        <div className="converted-usd small">
          &#8776; {usdFormatter.format(convertedValues.usd)}
        </div>
      </>
    )
  }, [convertedValues])

  if (!btcWalletId) {
    return null
  }

  const inputValue = Number.isNaN(input.amount) ? "" : input.amount.toString()
  const showInvoiceSpinner = Number.isNaN(input.debouncedAmount) || loading
  const showInvoice =
    input.satsForInvoice !== undefined && !Number.isNaN(input.satsForInvoice)

  return (
    <div className="receive">
      <Header />
      <div className="page-title">{translate("Receive Bitcoin")}</div>

      <div className="tabs">
        <div
          className={`tab ${input.layer === "lightning" ? "active" : "link"}`}
          onClick={toggleLayer}
        >
          {translate("Lightning")}
        </div>
        <div
          className={`tab ${input.layer === "onchain" ? "active" : "link"}`}
          onClick={toggleLayer}
        >
          {translate("OnChain")}
        </div>
      </div>

      <div className="tab-content">
        <div className="amount-input center-display">
          <div className="currency-label">
            {input.currency === "SATS" ? <SatSymbol /> : "$"}
          </div>
          <FormattedNumberInput
            key={input.currency}
            value={inputValue}
            onChange={handleAmountUpdate}
            onDebouncedChange={handleDebouncedAmountUpdate}
            placeholder={translate("Set invoice value in %{currency}", {
              currency: input.currency,
            })}
          />
          <div className="toggle-currency link" onClick={toggleCurrency}>
            &#8645;
          </div>
        </div>
        <div className="note-input center-display">
          <DebouncedTextarea
            onDebouncedChange={handleDebouncedMemoUpdate}
            name="memo"
            rows={3}
            placeholder={translate("Set a note for the sender here (optional)")}
          />
        </div>
        {conversionDisplay && (
          <div className="amount-converted">
            <div className="amount-converted">{conversionDisplay}</div>
          </div>
        )}
        <div className="action-container center-display">
          {showInvoiceSpinner && <Spinner size="big" />}
          {showInvoice && (
            <InvoiceGenerator
              layer={input.layer}
              btcWalletId={btcWalletId}
              btcAddress={btcAddress}
              regenerate={regenerateInvoice}
              amount={input.amount}
              currency={input.currency}
              memo={input.memo}
              satAmount={input.satsForInvoice as number}
              convertedUsdAmount={convertedValues?.usd || NaN}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Receive
