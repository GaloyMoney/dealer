import { useCallback, useEffect, useMemo, useState } from "react"

import { formatUsd, translate, useMutation } from "@galoymoney/client"
import {
  DebouncedTextarea,
  FormattedNumberInput,
  OnNumberValueChange,
  OnTextValueChange,
  SatFormat,
  SatSymbol,
  Spinner,
} from "@galoymoney/react"

import useMainQuery from "hooks/use-main-query"
import useMyUpdates from "hooks/use-my-updates"

import InvoiceGenerator from "components/receive/invoice-generator"
import Header from "components/header"
import { ButtonLink } from "components/link"
import { NoPropsFCT } from "store/types"

type InvoiceInputState = {
  layer: "lightning" | "onchain"
  currency: "USD" | "SATS"
  amount?: number | ""
  memo?: string
  satsForInvoice?: number
}

const Receive: NoPropsFCT = () => {
  const { btcWalletId } = useMainQuery()
  const { satsToUsd, usdToSats } = useMyUpdates()

  const [input, setInput] = useState<InvoiceInputState>({
    layer: "lightning",
    currency: "USD",
    amount: "",
    memo: "",
  })

  const [generateBtcAddress, { loading, errorsMessage, data }] =
    useMutation.onChainAddressCurrent()

  const shouldUpdateSatsForInvoice =
    Number.isNaN(input.satsForInvoice) &&
    typeof input.amount === "number" &&
    !Number.isNaN(input.amount)

  useEffect(() => {
    if (usdToSats && input.currency === "USD" && shouldUpdateSatsForInvoice) {
      setInput((currInput) => ({
        ...currInput,
        satsForInvoice: Math.round(usdToSats(input.amount as number)),
      }))
    }
  }, [input.currency, input.amount, input.memo, shouldUpdateSatsForInvoice, usdToSats])

  useEffect(() => {
    if (input.currency === "SATS" && shouldUpdateSatsForInvoice) {
      setInput((currInput) => ({
        ...currInput,
        satsForInvoice: input.amount as number,
      }))
    }
  }, [input.currency, input.amount, input.memo, shouldUpdateSatsForInvoice])

  useEffect(() => {
    if (input.layer === "onchain" && btcWalletId) {
      // Layer switched to onchain, generate a btc address
      generateBtcAddress({
        variables: {
          input: { walletId: btcWalletId },
        },
      })
    }
  }, [btcWalletId, generateBtcAddress, input.layer])

  if (errorsMessage) {
    console.debug("[BTC address error]:", errorsMessage)
    throw new Error("Unable to get BTC address for wallet")
  }

  const btcAddress = data?.onChainAddressCurrent?.address ?? undefined

  const handleAmountUpdate: OnNumberValueChange = useCallback(() => {
    setInput((currInput) => ({ ...currInput, amount: undefined, satsForInvoice: NaN }))
  }, [])

  const handleMemoUpdate: OnTextValueChange = useCallback(() => {
    setInput((currInput) => ({ ...currInput, memo: undefined, satsForInvoice: NaN }))
  }, [])

  const handleDebouncedAmountUpdate: OnNumberValueChange = useCallback((amount) => {
    setInput((currInput) => ({ ...currInput, amount }))
  }, [])

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
        newAmount = Math.round(satsToUsd(currInput.amount * 100)) / 100
      }

      if (currInput.currency === "USD" && currInput.satsForInvoice) {
        newAmount = currInput.satsForInvoice
      }

      return {
        ...currInput,
        currency: newCurrency,
        amount: newAmount,
        satsForInvoice: NaN,
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
      return <div className="converted-usd">&#8776; {formatUsd(convertedValues.usd)}</div>
    }

    return (
      <>
        <div className="converted-sats">
          <SatFormat amount={convertedValues.sats} />
        </div>
        <div className="converted-usd small">
          &#8776; {formatUsd(convertedValues.usd)}
        </div>
      </>
    )
  }, [convertedValues])

  const InvoiceGeneratorDisplay = () => {
    if (!btcWalletId) {
      return <ButtonLink to="/login">{translate("Login to send")}</ButtonLink>
    }

    const inputPending = input.amount === undefined || input.memo === undefined
    const showInvoiceSpinner = loading || inputPending
    const showInvoice =
      !inputPending &&
      input.satsForInvoice !== undefined &&
      !Number.isNaN(input.satsForInvoice)

    return (
      <>
        {showInvoiceSpinner && <Spinner size="big" />}
        {showInvoice && (
          <InvoiceGenerator
            layer={input.layer}
            btcWalletId={btcWalletId}
            btcAddress={btcAddress}
            regenerate={regenerateInvoice}
            amount={input.amount as number}
            currency={input.currency}
            memo={input.memo as string}
            satAmount={input.satsForInvoice as number}
            convertedUsdAmount={convertedValues?.usd || NaN}
          />
        )}
      </>
    )
  }

  return (
    <div className="receive">
      <Header page="receive-bitcoin" />
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
            initValue={input.amount}
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
            initValue={input.memo}
            onChange={handleMemoUpdate}
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
        <div className="action-container center-display">{InvoiceGeneratorDisplay()}</div>
      </div>
    </div>
  )
}

export default Receive
