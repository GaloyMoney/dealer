import { useCallback, useRef } from "react"

import { GaloyGQL, translate, useQuery } from "@galoymoney/client"
import { Spinner } from "@galoymoney/react"

import Header from "components/header"
import TransactionItem from "components/transactions/item"

const TRANSACTIONS_PER_PAGE = 25
const EMPTY_CONNECTION = {
  edges: null,
  pageInfo: { hasNextPage: false, hasPreviousPage: false },
} as const

type FCT = React.FC<{ username: string }>

const Transactions: FCT = ({ username }) => {
  const {
    loading,
    data: initialData,
    refetch: fetchTransactions,
  } = useQuery.transactionListForContact({
    variables: { username, first: TRANSACTIONS_PER_PAGE },
  })

  // The source of truth for listing the transactions
  // The data gets "cached" here and more pages are appended when they're fetched
  const transactionsRef = useRef<GaloyGQL.TransactionConnection>(EMPTY_CONNECTION)

  const initialTxsData = initialData?.me?.contactByUsername.transactions

  if (!transactionsRef.current.edges && initialTxsData) {
    transactionsRef.current = initialTxsData
  }

  const fetchNextTransactionsPage = useCallback(async () => {
    const { pageInfo } = transactionsRef.current

    if (pageInfo.hasNextPage) {
      const { data } = await fetchTransactions({
        username,
        first: TRANSACTIONS_PER_PAGE,
        after: pageInfo.endCursor,
      })

      const txsData = data?.me?.contactByUsername.transactions

      if (!txsData || !txsData.edges) {
        return
      }

      transactionsRef.current = {
        edges: transactionsRef.current?.edges?.concat(txsData.edges),
        pageInfo: txsData.pageInfo,
      }
    }
  }, [fetchTransactions, username])

  const { edges, pageInfo } = transactionsRef.current

  return (
    <div className="transaction-list">
      <Header page="transactions" />
      <div className="page-title">
        {translate("Transactions with %{contactUsername}", { contactUsername: username })}
      </div>
      {edges?.length === 0 && (
        <div className="no-data">{translate("No transactions")}</div>
      )}
      {edges?.map((edge) => {
        const node = edge?.node
        if (!node) {
          return null
        }
        return <TransactionItem key={node.id} tx={node} />
      })}
      {loading ? (
        <div className="load-more">
          <Spinner />
        </div>
      ) : (
        pageInfo.hasNextPage && (
          <div className="load-more link" onClick={fetchNextTransactionsPage}>
            {translate("Load more transactions")}
          </div>
        )
      )}
    </div>
  )
}

export default Transactions
