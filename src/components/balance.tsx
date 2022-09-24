import { formatUsd } from "@galoymoney/client"
import { SatFormat, Spinner } from "@galoymoney/react"

import useMyUpdates from "hooks/use-my-updates"
import { translate, history, useAuthContext } from "store/index"

const navigateToHome = () => {
  history.push("/")
}

type FCT = React.FC<{ btcBalance: number; usdBalance: number }>

const BalanceMain: FCT = ({ btcBalance, usdBalance }) => {
  const { satsToUsd } = useMyUpdates()

  return (
    <div className="balance" onClick={navigateToHome}>
      <div className="title">{translate("Current Balance")}</div>
      <div className="value">
        {Number.isNaN(btcBalance) && Number.isNaN(usdBalance) ? (
          <Spinner />
        ) : (
          satsToUsd && (
            <div className="primary">{formatUsd(satsToUsd(btcBalance) + usdBalance)}</div>
          )
        )}
      </div>
    </div>
  )
}

const Balance: FCT = ({ btcBalance, usdBalance }) => {
  const { isAuthenticated } = useAuthContext()

  if (!isAuthenticated) {
    return (
      <div className="balance" onClick={navigateToHome}>
        <div className="title">{translate("Current Balance")}</div>
        <div className="value">
          <div className="primary">
            <SatFormat amount={0} />
          </div>
          <div className="secondary">{formatUsd(0)}</div>
        </div>
      </div>
    )
  }

  return <BalanceMain btcBalance={btcBalance} usdBalance={usdBalance} />
}

export default Balance
