import { useCallback, useRef } from "react"

import { GaloyGQL, isThisMonth, isToday, isYesterday, useQuery } from "@galoymoney/client"
import { Spinner } from "@galoymoney/react"

import { translate } from "store/index"

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

  const sections = []

  if (edges) {
    const today = []
    const yesterday = []
    const thisMonth = []
    const prevMonths = []

    for (const txEdge of edges) {
      const tx = txEdge.node
      if (isToday(tx.createdAt)) {
        today.push(tx)
      } else if (isYesterday(tx.createdAt)) {
        yesterday.push(tx)
      } else if (isThisMonth(tx.createdAt)) {
        thisMonth.push(tx)
      } else {
        prevMonths.push(tx)
      }
    }

    if (today.length > 0) {
      sections.push({ title: translate("Today"), data: today })
    }

    if (yesterday.length > 0) {
      sections.push({ title: translate("Yesterday"), data: yesterday })
    }

    if (thisMonth.length > 0) {
      sections.push({ title: translate("This month"), data: thisMonth })
    }

    if (prevMonths.length > 0) {
      sections.push({ title: translate("Previous months"), data: prevMonths })
    }
  }

  return (
    <div className="transaction-list">
      <Header page="transactions" />
      <div className="page-title">
        {translate("Transactions with %{contactUsername}", { contactUsername: username })}
      </div>
      {edges?.length === 0 && (
        <div className="no-data">{translate("No transactions")}</div>
      )}

      {sections.map((section) => {
        return (
          <div key="section.title">
            <div className="section-title">{section.title}</div>
            <div className="content">
              {section.data.map((tx) => {
                return <TransactionItem key={tx.id} tx={tx} />
              })}
            </div>
          </div>
        )
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
