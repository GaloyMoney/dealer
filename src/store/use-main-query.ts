import { useQuery } from "@apollo/client"

import { setLocale } from "translate"
import useAuthToken from "store/use-auth-token"
import { GaloyGQL, queries } from "@galoymoney/client"

const useMainQuery = () => {
  const { hasToken } = useAuthToken()

  const { data } = useQuery<GaloyGQL.MeQuery>(queries.main, {
    variables: { hasToken },
    onCompleted: (completed) => {
      setLocale(completed?.me?.language)
    },
  })

  const me = data?.me
  const btcWallet = me?.defaultAccount?.wallets?.find(
    (wallet) => wallet?.__typename === "BTCWallet",
  )
  const btcWalletBalance = hasToken ? btcWallet?.balance ?? NaN : 0

  return {
    btcPrice: data?.btcPrice,
    pubKey: data?.globals?.nodesIds?.[0] ?? "",
    btcWalletId: btcWallet?.id,
    btcWalletBalance,
  }
}

export default useMainQuery
