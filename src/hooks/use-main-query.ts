import { GaloyGQL, useQuery } from "@galoymoney/client"

import { setLocale, useAppState, useAuthContext } from "store/index"

// FIX: should come from the client
type Language = "" | "en-US" | "es-SV"

const useMainQuery = () => {
  const { isAuthenticated } = useAuthContext()
  const { defaultLanguage } = useAppState()

  const { data, refetch } = isAuthenticated
    ? useQuery.main({
        variables: { isAuthenticated, recentTransactions: 5 },
        onCompleted: (completed) => {
          setLocale(completed?.me?.language ?? defaultLanguage)
        },
      })
    : { data: null, refetch: () => {} }

  const pubKey = data?.globals?.nodesIds?.[0] ?? ""
  const lightningAddressDomain = data?.globals?.lightningAddressDomain
  const btcPrice = data?.btcPrice ?? undefined

  const me = data?.me

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
