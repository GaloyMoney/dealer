import React, { useCallback, useEffect, useMemo } from "react"

import {
  parsePaymentDestination,
  ValidPaymentResponse,
  useDelayedQuery,
  formatUsd,
} from "@galoymoney/client"
import {
  DebouncedInput,
  OnTextValueChange,
  Spinner,
  QRCodeDetecor,
  SatFormat,
} from "@galoymoney/react"

import { config, translate } from "store/index"
import useMainQuery from "hooks/use-main-query"
import useMyUpdates from "hooks/use-my-updates"

import { SendScreenInput } from "components/pages/send"
import SendAction from "components/send/send-action"

type FCT = React.FC<{
  input: SendScreenInput
  setInput: React.Dispatch<React.SetStateAction<SendScreenInput>>
}>

const SendDestination: FCT = ({ input, setInput }) => {
  const { pubKey, btcWalletId, username } = useMainQuery()
  const { satsToUsd, usdToSats } = useMyUpdates()

  const [userDefaultWalletIdQuery, { loading }] = useDelayedQuery.userDefaultWalletId()

  const setInputFromParsedDestination = useCallback(
    async (parsedDestination: ValidPaymentResponse) => {
      const newInputState: Partial<SendScreenInput> = {
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
    [btcWalletId, setInput, userDefaultWalletIdQuery, username],
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

  const handleDestinationUpdate: OnTextValueChange = useCallback(() => {
    setInput((currInput) => ({
      ...currInput,
      errorMessage: undefined,
      destination: undefined,
    }))
  }, [setInput])

  const handleDebouncedDestinationUpdate: OnTextValueChange = useCallback(
    (debouncedDestination) => {
      setInput((currInput) => ({ ...currInput, destination: debouncedDestination }))
    },
    [setInput],
  )

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

  const parseQRCode = useCallback<(destination: string) => false | ValidPaymentResponse>(
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

  return (
    <div className="destination-container center-display">
      <div className="destination-input">
        <div className="input-label">{translate("Destination")}</div>
        <div className="destination">
          <DebouncedInput
            initValue={input.destination}
            onChange={handleDestinationUpdate}
            onDebouncedChange={handleDebouncedDestinationUpdate}
            disabled={loading}
            type="text"
            name="destination"
            autoComplete="off"
            placeholder={translate("username, invoice, or address")}
          />
          <QRCodeDetecor
            autoStart={config.isBrowser && window.location.pathname === "/scan"}
            startText=""
            stopText={translate("Close")}
            onCodeDetected={parseQRCode}
            onValidCode={setInputFromParsedDestination}
          />
        </div>
      </div>

      {conversionDisplay && <div className="amount-converted">{conversionDisplay}</div>}

      <div className="action-container">
        <SendAction input={input}>
          <button
            onClick={() => setInput((currInput) => ({ ...currInput, view: "amount" }))}
            disabled={!input.destination || loading}
          >
            {translate("Next")}{" "}
            {(input.destination === undefined || loading) && <Spinner size="small" />}
          </button>
        </SendAction>
      </div>
    </div>
  )
}

export default SendDestination
