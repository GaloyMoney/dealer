import { GaloyGQL, translate, useDelayedQuery, useQuery } from "@galoymoney/client"
import { Spinner } from "@galoymoney/react"
import { useCallback, useRef } from "react"
import useMainQuery from "../../hooks/use-main-query"
import Footer from "../footer"
import Header from "../header"

import TransactionItem from "../transactions/item"

const TRANSACTIONS_PER_PAGE = 25
const EMPTY_CONNECTION = {
  edges: null,
  pageInfo: { hasNextPage: false, hasPreviousPage: false },
} as const

const Transactions = {} as LayoutComponent<{
  username: string
}>

Transactions.Large = function Transactions({ username }) {
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
      <Header.Large page="transactions" />
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

Transactions.Small = function Transactions() {
  const { transactions } = useMainQuery()
  const [fetchTransactions, { loading }] = useDelayedQuery.transactionList()

  // The source of truth for listing the transactions
  // The data gets "cached" here and more pages are appended when they're fetched
  const transactionsRef = useRef<GaloyGQL.TransactionConnection>(EMPTY_CONNECTION)

  if (!transactionsRef.current.edges && transactions) {
    transactionsRef.current = transactions
  }

  const fetchNextTransactionsPage = async () => {
    const { pageInfo } = transactionsRef.current

    if (pageInfo.hasNextPage) {
      const { data } = await fetchTransactions({
        first: TRANSACTIONS_PER_PAGE,
        after: pageInfo.endCursor,
      })

      const txsData = data?.me?.defaultAccount?.wallets[0].transactions

      if (!txsData || !txsData.edges) {
        return
      }

      transactionsRef.current = {
        edges: transactionsRef.current?.edges?.concat(txsData.edges),
        pageInfo: txsData.pageInfo,
      }
    }
  }

  const { edges, pageInfo } = transactionsRef.current

  return (
    <>
      <div className="page-title">{translate("History")}</div>

      <div className="transaction-list">
        {edges?.length === 0 && (
          <div className="no-transactions">{translate("No transactions")}</div>
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
      <Footer page="transactions" />
    </>
  )
}

export default Transactions
