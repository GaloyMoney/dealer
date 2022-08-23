import { useQuery } from "@galoymoney/client"

import { setLocale, useAppState, useAuthContext } from "store/index"

// FIX: should come from the client
type Language = "" | "en-US" | "es-SV"

const useMainQuery = () => {
  const { isAuthenticated } = useAuthContext()
  const { defaultLanguage } = useAppState()

  const { data } = useQuery.main({
    variables: { isAuthenticated, recentTransactions: 5 },
    onCompleted: (completed) => {
      setLocale(completed?.me?.language ?? defaultLanguage)
    },
  })

  const pubKey = data?.globals?.nodesIds?.[0] ?? ""
  const lightningAddressDomain = data?.globals?.lightningAddressDomain
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
  const language = (me?.language ?? "DEFAULT") as Language

  return {
    lightningAddressDomain,
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
