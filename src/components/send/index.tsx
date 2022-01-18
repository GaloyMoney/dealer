import { useCallback, useEffect, useMemo, useState } from "react"

import config from "store/config"
import { satsFormatter, usdFormatter, useAppDispatcher } from "store"
import { useMyUpdates } from "store/use-my-updates"
import { translate } from "translate"

import FormattedNumberInput, { OnNumberValueChange } from "../formatted-number-input"
import Header from "../header"
import SatSymbol from "../sat-symbol"
import Spinner from "../spinner"
import DebouncedTextarea, { OnTextValueChange } from "../debounced-textarea"
import DebouncedInput from "../debounced-input"
import { parsePaymentDestination } from "galoy-client/src"
import useMainQuery from "store/use-main-query"
import SendAction from "./send-action"
import QUERY_USER_DEFAULT_WALLET_ID from "store/graphql/query.user-default-wallet-id"
import useDelayedQuery from "store/use-delayed-query"

const Send = () => {
  const dispatch = useAppDispatcher()
  const { pubKey, btcWalletId } = useMainQuery()
  const { satsToUsd, usdToSats } = useMyUpdates()

  const [input, setInput] = useState<InvoiceInput>({
    currency: "USD",
    amount: "",
    destination: "",
    memo: "",
  })

  const [userDefaultWalletIdQuery, { loading: userDefaultWalletIdLoading }] =
    useDelayedQuery(QUERY_USER_DEFAULT_WALLET_ID)

  useEffect(() => {
    if (usdToSats && input.currency === "USD" && typeof input.amount === "number") {
      setInput((currInput) => ({
        ...currInput,
        satAmount: Math.round(usdToSats(input.amount as number)),
      }))
    }
  }, [input.amount, input.currency, usdToSats])

  useEffect(() => {
    if (input.currency === "SATS" && typeof input.amount === "number") {
      setInput((currInput) => ({
        ...currInput,
        satAmount: input.amount as number,
      }))
    }
  }, [input.amount, input.currency])

  useEffect(() => {
    const parseInput = async () => {
      if (input.destination !== undefined) {
        const parsedDestination = parsePaymentDestination({
          destination: input.destination,
          network: config.network,
          pubKey,
        })

        const newInputState: Partial<InvoiceInput> = {
          valid: parsedDestination.valid,
          errorMessage: parsedDestination.errorMessage,
          paymentType: parsedDestination.paymentType,
          sameNode: parsedDestination.sameNode,
          fixedAmount: parsedDestination.amount !== undefined,
          paymentRequset: parsedDestination.paymentRequest,
          address: parsedDestination.address,
        }

        if (parsedDestination.paymentType === "intraledger") {
          // Validate account handle (and get the default wallet id for account)
          const { data, error } = await userDefaultWalletIdQuery({
            username: parsedDestination.handle,
          })

          if (error) {
            newInputState.errorMessage = error?.message || "Invaild username"
            console.error(error)
          } else {
            newInputState.reciepientWalletId = data?.userDefaultWalletId
          }
        }

        setInput((currInput) => ({
          ...currInput,
          ...newInputState,
          amount: newInputState.fixedAmount ? parsedDestination.amount : currInput.amount,
          currency: newInputState.fixedAmount ? "SATS" : currInput.currency,
        }))
      }
    }
    parseInput()
  }, [input.destination, pubKey, userDefaultWalletIdQuery])

  const handleAmountUpdate: OnNumberValueChange = useCallback(() => {
    setInput((currInput) => ({ ...currInput, amount: undefined }))
  }, [])

  const handleDebouncedAmountUpdate: OnNumberValueChange = useCallback(
    (debouncedAmount) => {
      setInput((currInput) => ({ ...currInput, amount: debouncedAmount }))
    },
    [],
  )

  const handleMemoUpdate: OnTextValueChange = useCallback(() => {
    setInput((currInput) => ({ ...currInput, memo: undefined }))
  }, [])

  const handleDebouncedMemoUpdate: OnTextValueChange = useCallback((debouncedMemo) => {
    setInput((currInput) => ({ ...currInput, memo: debouncedMemo }))
  }, [])

  const handleDestinationUpdate: OnTextValueChange = useCallback(() => {
    setInput((currInput) => ({ ...currInput, destination: undefined }))
  }, [])

  const handleDebouncedDestinationUpdate: OnTextValueChange = useCallback(
    (debouncedDestination) => {
      setInput((currInput) => ({ ...currInput, destination: debouncedDestination }))
    },
    [],
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
        newAmount = satsToUsd(currInput.amount)
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
  }, [satsToUsd])

  const convertedValues = useMemo(() => {
    if (!usdToSats || !satsToUsd || !input.amount) {
      return null
    }

    if (input.currency === "SATS") {
      return {
        usd: satsToUsd(input.amount),
      }
    }

    const satsForConversion = input.satAmount || usdToSats(input.amount)

    return {
      sats: satsForConversion,
      usd: satsToUsd(satsForConversion),
    }
  }, [input.amount, input.currency, input.satAmount, satsToUsd, usdToSats])

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

  const resetSendScreen = () => {
    dispatch({ type: "reset-current-screen" })
  }

  const inputValue = input.amount === undefined ? "" : input.amount.toString()
  const showSpinner =
    input.amount === undefined ||
    input.destination === undefined ||
    input.memo === undefined ||
    userDefaultWalletIdLoading

  return (
    <div className="send">
      <Header />
      <div className="page-title">{translate("Send Bitcoin")}</div>{" "}
      <div className="amount-input center-display">
        <div className="currency-label">
          {input.currency === "SATS" ? <SatSymbol /> : "$"}
        </div>
        <FormattedNumberInput
          key={input.currency}
          value={inputValue}
          onChange={handleAmountUpdate}
          onDebouncedChange={handleDebouncedAmountUpdate}
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
      <div className="destination-input center-display">
        <DebouncedInput
          onChange={handleDestinationUpdate}
          onDebouncedChange={handleDebouncedDestinationUpdate}
          name="destination"
          autoComplete="off"
          placeholder={translate("username or invoice")}
        />
      </div>
      <div className="note-input center-display">
        <DebouncedTextarea
          onChange={handleMemoUpdate}
          onDebouncedChange={handleDebouncedMemoUpdate}
          name="memo"
          rows={3}
          placeholder={translate("Set a note for the receiver here (optional)")}
        />
      </div>
      {conversionDisplay && <div className="amount-converted">{conversionDisplay}</div>}
      <div className="action-container center-display">
        {showSpinner ? (
          <Spinner size="big" />
        ) : (
          <SendAction {...input} btcWalletId={btcWalletId} reset={resetSendScreen} />
        )}
      </div>
    </div>
  )
}

export default Send
