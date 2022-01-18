import { ApolloError } from "@apollo/client"
import { MouseEvent } from "react"

import Spinner from "../spinner"
import SuccessCheckmark from "../sucess-checkmark"
import SatSymbol from "../sat-symbol"
import { satsFormatter, usdFormatter } from "store"
import { useMyUpdates } from "store/use-my-updates"

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
  error: ApolloError | undefined
  data: GraphQL.PaymentSendPayload | undefined
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
  const errorString = error?.message ?? data?.errors?.map((err) => err.message).join(", ")
  const success = data?.status === "SUCCESS"

  return (
    <>
      {errorString && <div className="error">{errorString}</div>}
      {success ? (
        <div className="invoice-paid">
          <SuccessCheckmark />
          <button onClick={reset}>Send another payment</button>
        </div>
      ) : (
        <>
          <FeeDisplay satAmount={feeSatAmount} />
          <button onClick={handleSend} disabled={loading}>
            Send {loading && <Spinner size="small" />}
          </button>
        </>
      )}
    </>
  )
}

export default SendActionDisplay
