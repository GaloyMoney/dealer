import { formatUsd } from "@galoymoney/client"
import { SatFormat, Spinner } from "@galoymoney/react"

import useMainQuery from "hooks/use-main-query"
import useMyUpdates from "hooks/use-my-updates"
import { translate, history, useAuthContext, NoPropsFCT } from "store/index"

const navigateToHome = () => {
  history.push("/")
}

const Balance: NoPropsFCT = () => {
  const { isAuthenticated } = useAuthContext()
  const { satsToUsd } = useMyUpdates()
  const { btcWalletBalance, usdWalletBalance, wallets } = useMainQuery()

  const content = () => {
    if (!isAuthenticated) {
      return (
        <>
          <div className="primary">
            <SatFormat amount={0} />
          </div>
          <div className="secondary">{formatUsd(0)}</div>
        </>
      )
    }

    if (!satsToUsd) {
      return <Spinner />
    }

    if (wallets.length === 1) {
      if (Number.isNaN(btcWalletBalance)) {
        return <Spinner />
      }

      return (
        <>
          <div className="primary">
            <SatFormat amount={btcWalletBalance} />
          </div>
          <div className="secondary">
            &#8776; {formatUsd(satsToUsd(btcWalletBalance))}
          </div>
        </>
      )
    }

    if (Number.isNaN(btcWalletBalance) && Number.isNaN(usdWalletBalance)) {
      return <Spinner />
    }

    return (
      <div className="primary">
        {formatUsd(satsToUsd(btcWalletBalance) + usdWalletBalance)}
      </div>
    )
  }

  return (
    <div className="balance" onClick={navigateToHome}>
      <div className="title">{translate("Current Balance")}</div>
      <div className="value">{content()}</div>
    </div>
  )
}

export default Balance
