import { useCallback, useEffect, useMemo } from "react"

import { formatUsd } from "@galoymoney/client"
import {
  DebouncedTextarea,
  FormattedNumberInput,
  Icon,
  OnNumberValueChange,
  OnTextValueChange,
  SatFormat,
  Spinner,
} from "@galoymoney/react"

import useMyUpdates from "hooks/use-my-updates"
import { translate } from "store/index"
import { ReceiveScreenInput } from "components/pages/receive"

type FCT = React.FC<{
  input: ReceiveScreenInput
  setInput: React.Dispatch<React.SetStateAction<ReceiveScreenInput>>
}>

const InvoiceInput: FCT = ({ input, setInput }) => {
  const { satsToUsd, usdToSats } = useMyUpdates()

  const updateSatAmount =
    Number.isNaN(input.satAmount) &&
    typeof input.amount === "number" &&
    !Number.isNaN(input.amount)

  useEffect(() => {
    if (usdToSats && input.currency === "USD" && updateSatAmount) {
      setInput((currInput) => ({
        ...currInput,
        satAmount: Math.round(usdToSats(input.amount as number)),
        usdAmount: input.amount as number,
      }))
    }
  }, [input.currency, input.amount, input.memo, updateSatAmount, usdToSats, setInput])

  useEffect(() => {
    if (satsToUsd && input.currency === "SATS" && updateSatAmount) {
      setInput((currInput) => ({
        ...currInput,
        satAmount: input.amount as number,
        usdAmount: satsToUsd(input.amount as number),
      }))
    }
  }, [input.currency, input.amount, input.memo, updateSatAmount, satsToUsd, setInput])

  const handleAmountUpdate: OnNumberValueChange = useCallback(
    (amount) => {
      setInput((currInput) => ({ ...currInput, amount, satAmount: NaN }))
    },
    [setInput],
  )

  const handleMemoUpdate: OnTextValueChange = useCallback(
    (memo) => {
      setInput((currInput) => ({ ...currInput, memo, satAmount: NaN }))
    },
    [setInput],
  )

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

      if (currInput.currency === "USD" && currInput.satAmount) {
        newAmount = currInput.satAmount
      }

      return {
        ...currInput,
        currency: newCurrency,
        amount: newAmount,
        satAmount: NaN,
      }
    })
  }, [satsToUsd, setInput])

  const convertedValues = useMemo(() => {
    if (!usdToSats || !satsToUsd || Number.isNaN(input.amount)) {
      return null
    }

    if (input.currency === "SATS") {
      return {
        usd: satsToUsd(input.amount as number),
      }
    }

    const satsForConversion = input.satAmount || usdToSats(input.amount as number)

    return {
      sats: satsForConversion,
      usd: satsToUsd(satsForConversion),
    }
  }, [input.amount, input.currency, input.satAmount, satsToUsd, usdToSats])

  const conversionDisplay = useMemo(() => {
    if (!convertedValues) {
      return null
    }

    if (convertedValues.sats === undefined) {
      return (
        <div className="amount-seconddary">&#8776; {formatUsd(convertedValues.usd)}</div>
      )
    }

    return (
      <>
        <div className="amount-primarys">
          <SatFormat amount={convertedValues.sats} />
        </div>
        <div className="amount-seconddary small">
          &#8776; {formatUsd(convertedValues.usd)}
        </div>
      </>
    )
  }, [convertedValues])

  return (
    <div className="content">
      {conversionDisplay && (
        <div className="amount-converted">
          <div className="amount-converted">{conversionDisplay}</div>
        </div>
      )}

      <div className="amount-and-note">
        <div className="amount-input center-display">
          <div className="input-label">{translate("Set Amount")}</div>
          <div className="amount-input-form">
            <div className="currency-label">
              {input.currency === "SATS" ? <Icon name="sat" /> : "$"}
            </div>
            <FormattedNumberInput
              initValue={input.amount}
              onChange={handleAmountUpdate}
              placeholder={translate("Set invoice value in %{currency}", {
                currency: input.currency,
              })}
            />
            <div className="toggle-currency link" onClick={toggleCurrency}>
              &#8645;
            </div>
          </div>
        </div>

        <div className="note-input center-display">
          <div className="input-label">{translate("Note or Label")}</div>
          <DebouncedTextarea
            initValue={input.memo}
            onChange={handleMemoUpdate}
            name="memo"
            rows={3}
            placeholder={translate("Set a note for the sender here (optional)")}
          />
        </div>
      </div>

      <div className="action-button center-display">
        <button
          onClick={() => setInput((currInput) => ({ ...currInput, view: "overview" }))}
          disabled={input.amount === undefined}
        >
          {translate("Update Invoice")}{" "}
          {input.amount === undefined && <Spinner size="small" />}
        </button>
      </div>
    </div>
  )
}

export default InvoiceInput
