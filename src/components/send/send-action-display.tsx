import { MouseEvent } from "react"

import { formatUsd, GaloyGQL, translate } from "@galoymoney/client"
import { SatFormat, Spinner, SuccessCheckmark } from "@galoymoney/react"

import useMyUpdates from "../../hooks/use-my-updates"

const FeeDisplay = ({ satAmount }: { satAmount: number | undefined }) => {
  const { satsToUsd } = useMyUpdates()
  if (satAmount === undefined) {
    return null
  }
  return (
    <div className="fee-amount">
      <div className="label">Fee</div>
      <div className="content">
        <SatFormat amount={satAmount} />
        {satsToUsd && satAmount > 0 && (
          <div className="fee-usd-amount small">
            &#8776; {formatUsd(satsToUsd(satAmount))}
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

const StatusDisplay = ({ status }: { status: GaloyGQL.PaymentSendResult }) => {
  switch (status) {
    case "ALREADY_PAID":
      return <div className="error">{translate("Invoice is already paid")}</div>
    case "SUCCESS":
      return <SuccessCheckmark />
    default:
      return <div className="error">{translate("Payment failed")}</div>
  }
}

const SendActionDisplay = ({
  loading,
  error,
  data,
  feeSatAmount,
  reset,
  handleSend,
}: SendActionDisplayProps) => {
  if (error) {
    return <div className="error">{error}</div>
  }

  if (data?.status) {
    return (
      <div className="invoice-status">
        <StatusDisplay status={data.status} />
        <button onClick={reset}>{translate("Send another payment")}</button>
      </div>
    )
  }

  return (
    <>
      {feeSatAmount !== undefined && <FeeDisplay satAmount={feeSatAmount} />}
      <button onClick={handleSend} disabled={loading}>
        {translate("Send Payment")} {loading && <Spinner size="small" />}
      </button>
    </>
  )
}

export default SendActionDisplay
