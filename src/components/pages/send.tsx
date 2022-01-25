import { useCallback, useEffect, useMemo, useState } from "react"

import config from "store/config"
import { satsFormatter, usdFormatter, useAppDispatcher } from "store"
import { useMyUpdates } from "store/use-my-updates"

import {
  GaloyGQL,
  parsePaymentDestination,
  queries,
  translate,
  ValidPaymentReponse,
} from "@galoymoney/client"
import {
  FormattedNumberInput,
  DebouncedInput,
  DebouncedTextarea,
  OnTextValueChange,
  SatSymbol,
  Spinner,
  useDelayedQuery,
  OnNumberValueChange,
} from "@galoymoney/react"

import useMainQuery from "store/use-main-query"
import Scan from "../send/scan"
import Header from "../header"
import { ButtonLink } from "components/link"
import SendAction from "components/send/send-action"

const Send = () => {
  const dispatch = useAppDispatcher()
  const { pubKey, btcWalletId, btcWalletBalance } = useMainQuery()
  const { satsToUsd, usdToSats } = useMyUpdates()

  const [input, setInput] = useState<InvoiceInput>({
    currency: "USD",
    amount: "",
    destination: "",
    memo: "",
  })

  const [userDefaultWalletIdQuery, { loading: userDefaultWalletIdLoading }] =
    useDelayedQuery<GaloyGQL.UserDefaultWalletIdQuery>(queries.userDefaultWalletId)

  useEffect(() => {
    if (usdToSats && input.currency === "USD" && typeof input.amount === "number") {
      const newSatAmount = Math.round(usdToSats(input.amount as number))
      setInput((currInput) => ({
        ...currInput,
        satAmount: newSatAmount,
        errorMessage: undefined,
      }))
    }
  }, [input.amount, input.currency, usdToSats])

  useEffect(() => {
    if (input.currency === "SATS" && typeof input.amount === "number") {
      setInput((currInput) => ({
        ...currInput,
        satAmount: input.amount as number,
        errorMessage: undefined,
      }))
    }
  }, [input.amount, input.currency])

  const setInputFromParsedDestination = useCallback(
    async (parsedDestination: ValidPaymentReponse) => {
      const newInputState: Partial<InvoiceInput> = {
        valid: parsedDestination.valid,
        errorMessage: parsedDestination.errorMessage,
        paymentType: parsedDestination.paymentType,
        sameNode: parsedDestination.sameNode,
        fixedAmount: parsedDestination.amount !== undefined,
        paymentRequset: parsedDestination.paymentRequest,
        address: parsedDestination.address,
      }

      // FIXME: Move userDefaultWalletIdQuery to galoy-client
      if (btcWalletId && parsedDestination.paymentType === "intraledger") {
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

      let newDestination: string | undefined = undefined
      if (parsedDestination.paymentType === "onchain") {
        newDestination = parsedDestination.address
      }

      if (parsedDestination.paymentType === "lightning") {
        newDestination = parsedDestination.paymentRequest
      }

      setInput((currInput) => ({
        ...currInput,
        ...newInputState,
        newDestination,
        amount: newInputState.fixedAmount ? parsedDestination.amount : currInput.amount,
        currency: newInputState.fixedAmount ? "SATS" : currInput.currency,
      }))
    },
    [btcWalletId, userDefaultWalletIdQuery],
  )

  useEffect(() => {
    const parseInput = async () => {
      if (input.destination !== undefined) {
        const parsedDestination = parsePaymentDestination({
          destination: input.destination,
          network: config.network,
          pubKey,
        })
        setInputFromParsedDestination(parsedDestination)
      }
    }
    parseInput()
  }, [btcWalletId, input.destination, pubKey, setInputFromParsedDestination])

  const handleAmountUpdate: OnNumberValueChange = useCallback(() => {
    setInput((currInput) => ({ ...currInput, amount: undefined }))
  }, [])

  const handleDebouncedAmountUpdate: OnNumberValueChange = useCallback(
    (debouncedAmount) => {
      setInput((currInput) => ({
        ...currInput,
        amount: debouncedAmount,
        satAmount: undefined,
      }))
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

  const resetSendScreen = useCallback(() => {
    dispatch({ type: "reset-current-screen" })
  }, [dispatch])

  const parseQRCode = useCallback<(destination: string) => false | ValidPaymentReponse>(
    (destination) => {
      if (destination.match(/^(bitcoin:|ligtning:|1|3|bc|ln)/iu)) {
        const parsedDestination = parsePaymentDestination({
          destination,
          network: config.network,
          pubKey,
        })

        if (!parsedDestination.valid) {
          return {
            ...parsedDestination,
            errorMessage: parsedDestination?.errorMessage || translate("Invalid QR Code"),
          }
        }

        return parsedDestination
      }
      return false
    },
    [pubKey],
  )

  const ActionDislapy = () => {
    if (!btcWalletId) {
      return <ButtonLink to="/login">{translate("Login to send")}</ButtonLink>
    }

    const pendingInput =
      input.amount === undefined ||
      input.destination === undefined ||
      input.memo === undefined

    const pendingSatAmount =
      typeof input.amount === "number" && input.satAmount === undefined

    if (input.satAmount && input.satAmount > btcWalletBalance) {
      const errorMessage = translate(
        "Payment amount exceeds balance of %{balance} sats",
        {
          balance: btcWalletBalance,
        },
      )
      return <div className="error">{errorMessage}</div>
    }

    const showSpinner = pendingInput || pendingSatAmount || userDefaultWalletIdLoading

    if (showSpinner) {
      return <Spinner size="big" />
    }

    return (
      <SendAction
        {...input}
        btcWalletId={btcWalletId}
        btcWalletBalance={btcWalletBalance}
        reset={resetSendScreen}
      />
    )
  }

  const inputValue = input.amount === undefined ? "" : input.amount.toString()

  return (
    <div className="send">
      <Header page="send-bitcoin" />
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
          newValue={input.newDestination}
          type="text"
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
      <Scan
        onBarcodeDetected={parseQRCode}
        onValidBarcode={setInputFromParsedDestination}
      />
      <div className="action-container center-display">{ActionDislapy()}</div>
    </div>
  )
}

export default Send
