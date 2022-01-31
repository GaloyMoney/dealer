import { translate } from "@galoymoney/client"
import useMainQuery from "../../hooks/use-main-query"
import TransactionItem from "./item"

// type Props = {
//   edges: Array<GaloyGQL.TransactionEdge>
// }

const TransactionList = () => {
  const { transactionsEdges } = useMainQuery()

  if (!transactionsEdges) {
    return null
  }

  return (
    <div className="transaction-list">
      {transactionsEdges.length === 0 && (
        <div className="no-transactions">{translate("No transactions")}</div>
      )}
      {transactionsEdges.map((edge) => {
        const node = edge?.node
        if (!node) {
          return null
        }
        return <TransactionItem key={node.id} transaction={node} />
      })}
    </div>
  )
}

export default TransactionList
