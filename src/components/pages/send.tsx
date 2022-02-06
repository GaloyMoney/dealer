import { useCallback, useEffect, useMemo, useState } from "react"

import {
  parsePaymentDestination,
  translate,
  ValidPaymentReponse,
  useDelayedQuery,
  formatUsd,
} from "@galoymoney/client"
import {
  FormattedNumberInput,
  DebouncedInput,
  DebouncedTextarea,
  OnTextValueChange,
  SatSymbol,
  Spinner,
  OnNumberValueChange,
  QRCodeDetecor,
  SatFormat,
} from "@galoymoney/react"

import config from "../../store/config"
import { useAppDispatcher } from "../../store"
import useMainQuery from "../../hooks/use-main-query"
import useMyUpdates from "../../hooks/use-my-updates"

import Header from "../header"
import { ButtonLink } from "../link"
import SendAction from "../send/send-action"

const Send = () => {
  const dispatch = useAppDispatcher()
  const { pubKey, btcWalletId, btcWalletBalance, username } = useMainQuery()
  const { satsToUsd, usdToSats } = useMyUpdates()

  const [input, setInput] = useState<InvoiceInput>({
    currency: "USD",
    amount: "",
    destination: "",
    memo: "",
  })

  const [userDefaultWalletIdQuery, { loading: userDefaultWalletIdLoading }] =
    useDelayedQuery.userDefaultWalletId()

  useEffect(() => {
    if (usdToSats && input.currency === "USD" && typeof input.amount === "number") {
      const newSatAmount = Math.round(usdToSats(input.amount as number))
      setInput((currInput) => ({
        ...currInput,
        satAmount: newSatAmount,
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

  const setInputFromParsedDestination = useCallback(
    async (parsedDestination: ValidPaymentReponse) => {
      const newInputState: Partial<InvoiceInput> = {
        valid: parsedDestination.valid,
        errorMessage: parsedDestination.errorMessage,
        paymentType: parsedDestination.paymentType,
        sameNode: parsedDestination.sameNode,
        fixedAmount: parsedDestination.amount !== undefined,
        paymentRequest: parsedDestination.paymentRequest,
        address: parsedDestination.address,
      }

      // FIXME: Move userDefaultWalletIdQuery to galoy-client
      if (btcWalletId && parsedDestination.paymentType === "intraledger") {
        if (parsedDestination.handle === username) {
          newInputState.errorMessage = translate("You can't send to yourself")
        } else {
          // Validate account handle (and get the default wallet id for account)
          const { data, errorsMessage } = await userDefaultWalletIdQuery({
            username: parsedDestination.handle as string,
          })

          if (errorsMessage) {
            newInputState.errorMessage = errorsMessage
          } else {
            newInputState.recipientWalletId = data?.userDefaultWalletId
          }
        }
      }

      if (parsedDestination.paymentType === "onchain") {
        newInputState.destination = parsedDestination.address
      }

      if (parsedDestination.paymentType === "lightning") {
        newInputState.destination = parsedDestination.paymentRequest
      }

      if (parsedDestination.memo) {
        newInputState.memo = parsedDestination.memo
      }

      setInput((currInput) => ({
        ...currInput,
        ...newInputState,
        amount: newInputState.fixedAmount ? parsedDestination.amount : currInput.amount,
        currency: newInputState.fixedAmount ? "SATS" : currInput.currency,
      }))
    },
    [btcWalletId, userDefaultWalletIdQuery, username],
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

  const resetSendScreen = useCallback(() => {
    dispatch({ type: "update", path: "/send" })
  }, [dispatch])

  const parseQRCode = useCallback<(destination: string) => false | ValidPaymentReponse>(
    (destination) => {
      if (destination.match(/^(bitcoin:|lightning:|1|3|bc|ln)/iu)) {
        const parsedDestination = parsePaymentDestination({
          destination,
          network: config.network,
          pubKey,
        })

        if (parsedDestination.valid) {
          return parsedDestination
        }

        return {
          ...parsedDestination,
          errorMessage: parsedDestination?.errorMessage || translate("Invalid QR Code"),
        }
      }
      return false
    },
    [pubKey],
  )

  const ActionDislapy = () => {
    if (!btcWalletId) {
      return <ButtonLink to="/login">{translate("Login to send")}</ButtonLink>
    }

    const inputPending =
      input.amount === undefined ||
      input.destination === undefined ||
      input.memo === undefined

    const satAmountPending =
      typeof input.amount === "number" && input.satAmount === undefined

    if (input.satAmount && input.satAmount > btcWalletBalance) {
      const errorMessage = translate(
        "Payment amount exceeds balance of %{balance} sats",
        { balance: btcWalletBalance },
      )
      return <div className="error">{errorMessage}</div>
    }

    const showSpinner = inputPending || satAmountPending || userDefaultWalletIdLoading

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

  return (
    <div className="send">
      <Header page="send-bitcoin" />
      <div className="amount-input center-display">
        <div className="currency-label">
          {input.currency === "SATS" ? <SatSymbol /> : "$"}
        </div>
        <FormattedNumberInput
          initValue={input.amount}
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
          initValue={input.destination}
          onChange={handleDestinationUpdate}
          onDebouncedChange={handleDebouncedDestinationUpdate}
          type="text"
          name="destination"
          autoComplete="off"
          placeholder={translate("username or invoice")}
        />
      </div>
      <div className="note-input center-display">
        <DebouncedTextarea
          initValue={input.memo}
          onChange={handleMemoUpdate}
          onDebouncedChange={handleDebouncedMemoUpdate}
          name="memo"
          rows={3}
          placeholder={translate("Set a note for the receiver here (optional)")}
        />
      </div>
      {conversionDisplay && <div className="amount-converted">{conversionDisplay}</div>}
      <div className="action-container center-display">{ActionDislapy()}</div>
      <QRCodeDetecor
        autoStart={document.location.pathname === "/scan"}
        startText={translate("Scan QR code")}
        stopText={translate("Close")}
        onCodeDetected={parseQRCode}
        onValidCode={setInputFromParsedDestination}
      />
    </div>
  )
}

export default Send
