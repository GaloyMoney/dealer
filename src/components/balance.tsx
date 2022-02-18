import { formatUsd, translate } from "@galoymoney/client"
import { SatFormat, SatSymbol, Spinner } from "@galoymoney/react"

import useMyUpdates from "../hooks/use-my-updates"

import { history } from "../store"
import { useAuthContext } from "../store/use-auth-context"

const navigateToHome = () => {
  history.push("/")
}

const MyBalance: React.FC<{ balance: number; layout: "Small" | "Large" }> =
  function Balance({ balance, layout }) {
    const { isAuthenticated } = useAuthContext()
    const { satsToUsd } = useMyUpdates()

    if (!isAuthenticated) {
      return (
        <div className="balance" onClick={navigateToHome}>
          {layout === "Large" && (
            <div className="title">{translate("Current Balance")}</div>
          )}
          <div className="value">
            <div className="primary">
              <SatSymbol />0
            </div>
            <div className="secondary">{formatUsd(0)}</div>
          </div>
        </div>
      )
    }

    return (
      <div className="balance" onClick={navigateToHome}>
        {layout === "Large" && (
          <div className="title">{translate("Current Balance")}</div>
        )}
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

const Balance = {} as LayoutComponent<{ balance: number }>

Balance.Small = function Balance({ balance }) {
  return <MyBalance balance={balance} layout="Small" />
}

Balance.Large = function Balance({ balance }) {
  return <MyBalance balance={balance} layout="Large" />
}

export default Balance
