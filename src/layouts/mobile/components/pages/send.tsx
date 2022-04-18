import { useCallback, useEffect, useMemo, useState } from "react"

import {
  parsePaymentDestination,
  translate,
  ValidPaymentReponse,
  useDelayedQuery,
  formatUsd,
  PaymentType,
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

import config from "store/config"
import { useAppDispatcher } from "store/index"
import useMainQuery from "hooks/use-main-query"
import useMyUpdates from "hooks/use-my-updates"

import Link, { ButtonLink } from "components/link"
import SendAction from "components/send/send-action"

export type InvoiceInput = {
  view?: "destination" | "amount" | "confirm"
  currency: "USD" | "SATS"

  // undefined in input is used to indicate their changing state
  amount?: number | ""
  destination?: string
  memo?: string

  satAmount?: number // from price conversion

  valid?: boolean // from parsing
  errorMessage?: string
  paymentType?: PaymentType

  sameNode?: boolean
  fixedAmount?: boolean // if the invoice has amount
  paymentRequest?: string // if payment is lightning
  address?: string // if payment is onchain
  recipientWalletId?: string // if payment is intraledger

  newDestination?: string // for scanned codes
}

type FCT = React.FC<{ to?: string }>

const Send: FCT = ({ to }) => {
  const dispatch = useAppDispatcher()
  const { pubKey, btcWalletId, btcWalletBalance, username } = useMainQuery()
  const { satsToUsd, usdToSats } = useMyUpdates()

  const [input, setInput] = useState<InvoiceInput>({
    view: "destination",
    currency: "USD",
    amount: "",
    destination: to ?? "",
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
  }, [input.currency, input.amount, usdToSats])

  useEffect(() => {
    if (input.currency === "SATS" && typeof input.amount === "number") {
      setInput((currInput) => ({
        ...currInput,
        satAmount: input.amount as number,
      }))
    }
  }, [input.currency, input.amount])

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

  const handleAmountUpdate: OnNumberValueChange = useCallback((newValue) => {
    setInput((currInput) => ({ ...currInput, amount: newValue }))
  }, [])

  const handleMemoUpdate: OnTextValueChange = useCallback((newValue) => {
    setInput((currInput) => ({ ...currInput, memo: newValue }))
  }, [])

  const handleDestinationUpdate: OnTextValueChange = useCallback(() => {
    setInput((currInput) => ({
      ...currInput,
      errorMessage: undefined,
      destination: undefined,
    }))
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

  const resetSendScreen = useCallback(() => {
    dispatch({ type: "update-with-key", path: "/send" })
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
      <div className="page-title">{translate("Send Bitcoin")}</div>

      {input.view === "destination" && (
        <>
          <div className="destination-input center-display">
            <div className="input-label">Sending bitcoin to</div>
            <div className="destination">
              <DebouncedInput
                initValue={input.destination}
                onChange={handleDestinationUpdate}
                onDebouncedChange={handleDebouncedDestinationUpdate}
                type="text"
                name="destination"
                autoComplete="off"
                placeholder={translate("username or invoice")}
              />
              <QRCodeDetecor
                startText=""
                stopText={translate("Close")}
                onCodeDetected={parseQRCode}
                onValidCode={setInputFromParsedDestination}
              />
            </div>
          </div>
          <div className="note-input center-display">
            <div className="input-label">What for</div>
            <DebouncedTextarea
              initValue={input.memo}
              onChange={handleMemoUpdate}
              name="memo"
              rows={3}
              placeholder={translate("Set a note for the receiver here (optional)")}
            />
          </div>

          <div className="action-button center-display">
            {input.errorMessage ? (
              <div className="error">{input.errorMessage}</div>
            ) : (
              <button
                onClick={() =>
                  setInput((currInput) => ({ ...currInput, view: "amount" }))
                }
                disabled={!input.destination}
              >
                {translate("Next")}{" "}
                {input.destination === undefined && <Spinner size="small" />}
              </button>
            )}
          </div>
        </>
      )}

      {input.view === "amount" && (
        <div className="amount-input-container">
          <div className="input-label">How much would you like to send?</div>
          <div className="amount-input center-display">
            <div className="currency-label">
              {input.currency === "SATS" ? <SatSymbol /> : "$"}
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

          {conversionDisplay && (
            <div className="amount-converted">{conversionDisplay}</div>
          )}

          <div className="action-button center-display">
            {input.errorMessage ? (
              <div className="error">{input.errorMessage}</div>
            ) : (
              <button
                onClick={() =>
                  setInput((currInput) => ({ ...currInput, view: "confirm" }))
                }
                disabled={!input.amount}
              >
                {translate("Next")}{" "}
                {input.amount === undefined && <Spinner size="small" />}
              </button>
            )}
          </div>
        </div>
      )}

      {input.view === "confirm" && (
        <>
          <div className="send-confirm center-display">
            <div className="item">
              <div className="label">Amount</div>
              <div className="content">{conversionDisplay}</div>
            </div>

            <div className="item">
              <div className="label">To</div>
              <div className="content">{input.destination}</div>
            </div>

            {input.memo && (
              <div className="item">
                <div className="label">What for</div>
                <div className="content">{input.memo}</div>
              </div>
            )}
          </div>

          <div className="action-container">{ActionDislapy()}</div>
        </>
      )}

      <div className="action-button center-display">
        <Link to="/">{translate("Cancel")}</Link>
      </div>
    </div>
  )
}

export default Send
