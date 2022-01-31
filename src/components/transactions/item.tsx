import { formatRelativeTime, formatUsd, GaloyGQL } from "@galoymoney/client"
import { SatFormat } from "@galoymoney/react"

type Props = {
  transaction: GaloyGQL.Transaction
}
const computeUsdAmount = (tx: GaloyGQL.Transaction) => {
  const { settlementAmount, settlementPrice } = tx
  const { base, offset } = settlementPrice
  const usdPerSat = base / 10 ** offset / 100
  return settlementAmount * usdPerSat
}

const descriptionDisplay = (tx: GaloyGQL.Transaction) => {
  const { memo, direction, settlementVia } = tx
  if (memo) {
    return memo
  }

  const isReceive = direction === "RECEIVE"

  switch (settlementVia.__typename) {
    case "SettlementViaOnChain":
      return "OnChain Payment"
    case "SettlementViaLn":
      return "Invoice"
    case "SettlementViaIntraLedger":
      return isReceive
        ? `From ${settlementVia.counterPartyUsername || "Galoy Wallet"}`
        : `To ${settlementVia.counterPartyUsername || "Galoy Wallet"}`
  }
}

const TransactionItem = ({ transaction }: Props) => {
  const isReceive = transaction.direction === "RECEIVE"
  const isPending = transaction.status === "PENDING"
  const description = descriptionDisplay(transaction)
  const dateDisplay = formatRelativeTime(transaction.createdAt)
  const usdAmount = computeUsdAmount(transaction)

  return (
    <div
      className={`transaction-item pending-${isPending} direction-${transaction.direction.toLocaleLowerCase()}`}
    >
      <div className="icon">
        <i
          aria-hidden
          className={`fas ${isReceive ? "fa-dot-circle" : "fa-paper-plane"}`}
        ></i>
      </div>

      <div className="content">
        <div className="description">{description}</div>
        <div className="date">{dateDisplay}</div>
      </div>

      <div className="amount">
        <div>
          <SatFormat amount={transaction.settlementAmount} />
        </div>
        <div className="converted-usd">{formatUsd(usdAmount)}</div>
      </div>
    </div>
  )
}

export default TransactionItem
