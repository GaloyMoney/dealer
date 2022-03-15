import { formatUsd, translate } from "@galoymoney/client"
import { SatFormat, SatSymbol, Spinner } from "@galoymoney/react"

import useMyUpdates from "hooks/use-my-updates"
import { history } from "store/index"
import { useAuthContext } from "store/use-auth-context"

const navigateToHome = () => {
  history.push("/")
}

type FCT = React.FC<{ balance: number }>

const BalanceMain: FCT = ({ balance }) => {
  const { satsToUsd } = useMyUpdates()

  return (
    <div className="balance" onClick={navigateToHome}>
      <div className="title">{translate("Current Balance")}</div>
      <div className="value">
        {Number.isNaN(balance) ? (
          <Spinner />
        ) : (
          <>
            <div className="primary">
              <SatFormat amount={balance} />
            </div>
            {satsToUsd && (
              <div className="secondary">&#8776; {formatUsd(satsToUsd(balance))}</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const Balance: FCT = ({ balance }) => {
  const { isAuthenticated } = useAuthContext()

  if (!isAuthenticated) {
    return (
      <div className="balance" onClick={navigateToHome}>
        <div className="title">{translate("Current Balance")}</div>
        <div className="value">
          <div className="primary">
            <SatSymbol />0
          </div>
          <div className="secondary">{formatUsd(0)}</div>
        </div>
      </div>
    )
  }

  return <BalanceMain balance={balance} />
}

export default Balance
