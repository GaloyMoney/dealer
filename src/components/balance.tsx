import { history, useAppState } from "store"
import { useMyUpdates } from "store/use-my-updates"
import { translate } from "translate"
import Spinner from "./spinner"

const SatSymbol = () => (
  <i aria-hidden className="fak fa-satoshisymbol-solidtilt sat-symbol" />
)

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

const satsFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

const navigateToHome = () => {
  history.push("/")
}

type Props = {
  balance: number
  initialPrice: PriceData
}

const MyBalance = ({ balance, initialPrice }: Props) => {
  const { satsToUsd } = useMyUpdates(initialPrice)

  return (
    <div className="balance" onClick={navigateToHome}>
      <div className="title">{translate("CurrentBalance")}</div>
      <div className="value">
        {Number.isNaN(balance) ? (
          <Spinner />
        ) : (
          <div className="primary">
            <SatSymbol />
            {satsFormatter.format(balance)}
          </div>
        )}
        {satsToUsd && (
          <div className="secondary">
            &#8776; {usdFormatter.format(satsToUsd(balance))}
          </div>
        )}
      </div>
    </div>
  )
}

const Balance = ({ balance, initialPrice }: Props) => {
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

  return <MyBalance balance={balance} initialPrice={initialPrice} />
}

export default Balance
