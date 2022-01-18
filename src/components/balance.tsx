import { history, useAppState, satsFormatter, usdFormatter } from "store"
import { useMyUpdates } from "store/use-my-updates"
import { translate } from "translate"
import SatSymbol from "./sat-symbol"
import Spinner from "./spinner"

const navigateToHome = () => {
  history.push("/")
}

type Props = {
  balance: number
}

const MyBalance = ({ balance }: Props) => {
  const { satsToUsd } = useMyUpdates()

  return (
    <div className="balance" onClick={navigateToHome}>
      <div className="title">{translate("CurrentBalance")}</div>
      <div className="value">
        {Number.isNaN(balance) ? (
          <Spinner />
        ) : (
          <>
            <div className="primary">
              <SatSymbol />
              {satsFormatter.format(balance)}
            </div>
            {satsToUsd && (
              <div className="secondary">
                &#8776; {usdFormatter.format(satsToUsd(balance))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const Balance = ({ balance }: Props) => {
  const { authToken } = useAppState()

  if (!authToken) {
    return (
      <div className="balance" onClick={navigateToHome}>
        <div className="title">{translate("CurrentBalance")}</div>
        <div className="value">
          <div className="primary">
            <SatSymbol />0
          </div>
          <div className="secondary">{usdFormatter.format(0)}</div>
        </div>
      </div>
    )
  }

  return <MyBalance balance={balance} />
}

export default Balance
