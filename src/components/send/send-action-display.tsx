import { MouseEvent } from "react"

import { SatSymbol, Spinner, SuccessCheckmark } from "@galoymoney/react"

import { satsFormatter, usdFormatter } from "store"
import { useMyUpdates } from "store/use-my-updates"
import { GaloyGQL } from "@galoymoney/client"

const FeeDisplay = ({ satAmount }: { satAmount: number | undefined }) => {
  const { satsToUsd } = useMyUpdates()
  if (satAmount === undefined) {
    return null
  }
  return (
    <div className="fee-amount">
      <div className="label">Fee</div>
      <div className="content">
        <SatSymbol />
        {satsFormatter.format(satAmount)}
        {satsToUsd && satAmount > 0 && (
          <div className="fee-usd-amount small">
            &#8776; {usdFormatter.format(satsToUsd(satAmount))}
          </div>
        )}
      </div>
    </div>
  )
}

type SendActionDisplayProps = {
  loading: boolean
  error: string | undefined
  data: GaloyGQL.PaymentSendPayload | undefined
  feeSatAmount: number | undefined
  reset: () => void
  handleSend: (event: MouseEvent<HTMLButtonElement>) => void
}

const SendActionDisplay = ({
  loading,
  error,
  data,
  feeSatAmount,
  reset,
  handleSend,
}: SendActionDisplayProps) => {
  const success = data?.status === "SUCCESS"

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <>
      {success ? (
        <div className="invoice-paid">
          <SuccessCheckmark />
          <button onClick={reset}>Send another payment</button>
        </div>
      ) : (
        <>
          {feeSatAmount !== undefined && <FeeDisplay satAmount={feeSatAmount} />}
          <button onClick={handleSend} disabled={loading}>
            Send {loading && <Spinner size="small" />}
          </button>
        </>
      )}
    </>
  )
}

export default SendActionDisplay