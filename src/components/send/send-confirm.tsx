import { useMemo } from "react"

import { formatUsd } from "@galoymoney/client"
import { SatFormat } from "@galoymoney/react"

import { translate } from "store/index"
import useMyUpdates from "hooks/use-my-updates"

import { SendScreenInput } from "components/pages/send"
import SendAction from "components/send/send-action"

type FCT = React.FC<{ input: SendScreenInput }>

const SendConfirm: FCT = ({ input }) => {
  const { satsToUsd, usdToSats } = useMyUpdates()

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

  const destinationLine =
    !input.destination || input.destination.length < 24
      ? input.destination
      : input.destination.substring(0, 12) +
        "..." +
        input.destination.substring(input.destination.length - 12)

  return (
    <>
      <div className="send-confirm center-display">
        <div className="item">
          <div className="label">{translate("Amount")}</div>
          <div className="content">{conversionDisplay}</div>
        </div>

        <div className="item">
          <div className="label">{translate("To")}</div>
          <div className="content">{destinationLine}</div>
        </div>

        {input.memo && (
          <div className="item">
            <div className="label">{translate("Note")}</div>
            <div className="content">{input.memo}</div>
          </div>
        )}

        <div className="action-container">
          <SendAction input={input} />
        </div>
      </div>
    </>
  )
}

export default SendConfirm
