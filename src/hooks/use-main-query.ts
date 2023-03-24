import { gql } from "@apollo/client"
import { GaloyGQL } from "@galoymoney/client"

import { setLocale, useAppState, useAuthContext } from "store/index"
import { useMainQuery as useMainQueryGenerated } from "graphql/generated"

// TODO: move away from big gql queries in the future
gql`
  query main($isAuthenticated: Boolean!, $recentTransactions: Int) {
    globals {
      nodesIds
      lightningAddressDomain
      __typename
    }
    btcPrice {
      base
      offset
      currencyUnit
      formattedAmount
      __typename
    }
    me @include(if: $isAuthenticated) {
      ...Me
      __typename
    }
  }
  fragment Me on User {
    id
    language
    username
    phone
    defaultAccount {
      id
      defaultWalletId
      transactions(first: $recentTransactions) {
        ...TransactionList
        __typename
      }
      wallets {
        id
        balance
        walletCurrency
        __typename
      }
      __typename
    }
    __typename
  }
  fragment TransactionList on TransactionConnection {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
      __typename
    }
    edges {
      cursor
      node {
        __typename
        id
        status
        direction
        memo
        createdAt
        settlementAmount
        settlementFee
        settlementCurrency
        settlementPrice {
          base
          offset
          currencyUnit
          formattedAmount
          __typename
        }
        initiationVia {
          __typename
          ... on InitiationViaIntraLedger {
            counterPartyWalletId
            counterPartyUsername
            __typename
          }
          ... on InitiationViaLn {
            paymentHash
            __typename
          }
          ... on InitiationViaOnChain {
            address
            __typename
          }
        }
        settlementVia {
          __typename
          ... on SettlementViaIntraLedger {
            counterPartyWalletId
            counterPartyUsername
            __typename
          }
          ... on SettlementViaLn {
            paymentSecret
            __typename
          }
          ... on SettlementViaOnChain {
            transactionHash
            __typename
          }
        }
      }
      __typename
    }
    __typename
  }
`

// FIX: should come from the client
type Language = "" | "en-US" | "es-SV"

const useMainQuery = () => {
  const { isAuthenticated } = useAuthContext()
  const { defaultLanguage } = useAppState()

  const { data, refetch } = useMainQueryGenerated({
    variables: { isAuthenticated, recentTransactions: 10 },
    onCompleted: (completed) => {
      setLocale(completed?.me?.language ?? defaultLanguage)
    },
    context: {
      credentials: isAuthenticated ? "include" : "omit",
    },
  })

  const pubKey = data?.globals?.nodesIds?.[0] ?? ""
  const lightningAddressDomain = data?.globals?.lightningAddressDomain
  const btcPrice = data?.btcPrice ?? undefined

  const me = data?.me

  // TODO: remove this when migration to graphql-codegen is done
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const wallets = (data?.me?.defaultAccount?.wallets ?? []) as Array<GaloyGQL.Wallet>
  const defaultWalletId = data?.me?.defaultAccount?.defaultWalletId
  const defaultWallet = wallets?.find((wallet) => wallet?.id === defaultWalletId)

  const btcWallet = me?.defaultAccount?.wallets?.find(
    (wallet) => wallet?.__typename === "BTCWallet",
  ) as GaloyGQL.BtcWallet
  const btcWalletId = btcWallet?.id
  const btcWalletBalance = isAuthenticated ? btcWallet?.balance ?? NaN : 0

  const transactions = me?.defaultAccount?.transactions

  const usdWallet = me?.defaultAccount?.wallets?.find(
    (wallet) => wallet?.__typename === "UsdWallet",
  ) as GaloyGQL.UsdWallet
  const usdWalletId = usdWallet?.id
  const usdWalletBalanceInCents = isAuthenticated ? usdWallet?.balance ?? NaN : 0

  const username = me?.username
  const phoneNumber = me?.phone
  const language = (me?.language ?? "DEFAULT") as Language

  return {
    lightningAddressDomain,
    btcPrice,
    pubKey,

    refetch,

    wallets,
    defaultWallet,
    defaultWalletId,

    btcWallet,
    btcWalletId,
    btcWalletBalance,

    usdWallet,
    usdWalletId,
    usdWalletBalance: usdWalletBalanceInCents / 100,

    transactions,

    username,
    phoneNumber,
    language,
  }
}

export default useMainQuery
