import { setLocale, useQuery } from "@galoymoney/client"

import { useAuthContext } from "../store/use-auth-context"

const useMainQuery = () => {
  const { isAuthenticated } = useAuthContext()

  const { data } = useQuery.main({
    variables: { hasToken: isAuthenticated, recentTransactions: 5 },
    onCompleted: (completed) => {
      setLocale(completed?.me?.language)
    },
  })

  const pubKey = data?.globals?.nodesIds?.[0] ?? ""
  const btcPrice = data?.btcPrice ?? undefined

  const me = data?.me
  const btcWallet = me?.defaultAccount?.wallets?.find(
    (wallet) => wallet?.__typename === "BTCWallet",
  )
  const btcWalletId = btcWallet?.id
  const btcWalletBalance = isAuthenticated ? btcWallet?.balance ?? NaN : 0

  const transactions = btcWallet?.transactions

  const username = me?.username
  const phoneNumber = me?.phone
  const language = me?.language

  return {
    btcPrice,
    pubKey,
    btcWalletId,
    btcWalletBalance,
    transactions,
    username,
    phoneNumber,
    language,
  }
}

export default useMainQuery
