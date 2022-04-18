import { useRef } from "react"

import {
  GaloyGQL,
  isThisMonth,
  isToday,
  isYesterday,
  translate,
  useDelayedQuery,
} from "@galoymoney/client"
import { Spinner } from "@galoymoney/react"

import TransactionItem from "components/transactions/item"
import useMainQuery from "hooks/use-main-query"
import Footer from "components/footer"
import { NoPropsFCT } from "store/types"

const TRANSACTIONS_PER_PAGE = 25
const EMPTY_CONNECTION = {
  edges: null,
  pageInfo: { hasNextPage: false, hasPreviousPage: false },
} as const

const Transactions: NoPropsFCT = () => {
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
    <>
      <div className="page-title">{translate("History")}</div>

      <div className="transaction-list">
        {edges?.length === 0 && (
          <div className="no-transactions">{translate("No transactions")}</div>
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
      <Footer page="transactions" />
    </>
  )
}

export default Transactions
