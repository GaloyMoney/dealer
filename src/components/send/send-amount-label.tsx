import { useCallback, useEffect, useMemo } from "react"

import { formatUsd } from "@galoymoney/client"
import {
  FormattedNumberInput,
  DebouncedTextarea,
  OnTextValueChange,
  Spinner,
  OnNumberValueChange,
  SatFormat,
  Icon,
} from "@galoymoney/react"

import { translate } from "store/index"
import useMyUpdates from "hooks/use-my-updates"

import { SendScreenInput } from "components/pages/send"
import SendAction from "components/send/send-action"

type FCT = React.FC<{
  input: SendScreenInput
  setInput: React.Dispatch<React.SetStateAction<SendScreenInput>>
}>

const SendAmountLabel: FCT = ({ input, setInput }) => {
  const { satsToUsd, usdToSats } = useMyUpdates()

  useEffect(() => {
    if (usdToSats && input.currency === "USD" && typeof input.amount === "number") {
      const newSatAmount = Math.round(usdToSats(input.amount as number))
      setInput((currInput) => ({
        ...currInput,
        satAmount: newSatAmount,
      }))
    }
  }, [input.currency, input.amount, usdToSats, setInput])

  useEffect(() => {
    if (input.currency === "SATS" && typeof input.amount === "number") {
      setInput((currInput) => ({
        ...currInput,
        satAmount: input.amount as number,
      }))
    }
  }, [input.currency, input.amount, setInput])

  const handleAmountUpdate: OnNumberValueChange = useCallback(
    (newValue) => {
      setInput((currInput) => ({ ...currInput, amount: newValue }))
    },
    [setInput],
  )

  const handleMemoUpdate: OnTextValueChange = useCallback(
    (newValue) => {
      setInput((currInput) => ({ ...currInput, memo: newValue }))
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
      }
    })
  }, [satsToUsd, setInput])

  const conversionDisplay = useMemo(() => {
    if (!usdToSats || !satsToUsd || !input.amount) {
      return null
    }

    if (input.currency === "SATS") {
      return (
        <div className="amount-display">
          <div className="primary">
            <SatFormat amount={input.satAmount || usdToSats(input.amount)} />
          </div>
          <div className="converted">&#8776; {formatUsd(satsToUsd(input.amount))}</div>
        </div>
      )
    }

    return (
      <div className="amount-display">
        <div className="primary">{formatUsd(input.amount)}</div>
        <div className="converted">
          &#8776; <SatFormat amount={input.satAmount || usdToSats(input.amount)} />
        </div>
      </div>
    )
  }, [input.amount, input.currency, input.satAmount, satsToUsd, usdToSats])

  return (
    <div>
      <div className="amount-input center-display">
        <div className="input-label">{translate("Amount")}</div>
        <div className="amount-input-form">
          <div className="currency-label">
            {input.currency === "SATS" ? <Icon name="sat" /> : "$"}
          </div>
          <FormattedNumberInput
            initValue={input.amount}
            onChange={handleAmountUpdate}
            disabled={input.fixedAmount}
            autoComplete="off"
            placeholder={translate("Set value to send in %{currency}", {
              currency: input.currency,
            })}
          />
          {!input.fixedAmount && (
            <div className="toggle-currency link" onClick={toggleCurrency}>
              &#8645;
            </div>
          )}
        </div>
      </div>

      <div className="note-input center-display">
        <div className="input-label">{translate("Note or Label")}</div>
        <DebouncedTextarea
          initValue={input.memo}
          onChange={handleMemoUpdate}
          name="memo"
          rows={3}
          placeholder={translate("Set a note for the receiver here (optional)")}
        />
      </div>

      {conversionDisplay && <div className="amount-converted">{conversionDisplay}</div>}

      <div className="action-button center-display">
        <SendAction input={input}>
          <button
            onClick={() => setInput((currInput) => ({ ...currInput, view: "confirm" }))}
            disabled={!input.amount}
          >
            {translate("Next")} {input.amount === undefined && <Spinner size="small" />}
          </button>
        </SendAction>
      </div>
    </div>
  )
}

export default SendAmountLabel
