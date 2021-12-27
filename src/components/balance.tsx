import { translate } from "translate"

const Balance = ({ balance }: { balance: number }) => {
  return (
    <div className="balance">
      <div className="title">{translate("CurrentBalance")}</div>
      <div className="value">
        <div className="primary">$0</div>
        <div className="secondary">({balance} sats)</div>
      </div>
    </div>
  )
}

export default Balance
