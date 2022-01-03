import { useQuery } from "@apollo/client"

import { setLocale } from "translate"
import QUERY_ME from "store/graphql/query.main"
import useAuthToken from "store/use-auth-token"

const useMainQuery = () => {
  const { hasToken } = useAuthToken()

  const { data } = useQuery(QUERY_ME, {
    variables: { hasToken },
    onCompleted: (completed) => {
      setLocale(completed?.me?.language)
    },
  })

  const me = data?.me
  const btcWallet = me?.defaultAccount?.wallets?.find(
    (wallet: GraphQL.BtcWallet) => wallet?.__typename === "BTCWallet",
  )
  const btcWalletBalance = hasToken ? btcWallet?.balance ?? NaN : 0

  return {
    btcPrice: data?.btcPrice,
    btcWalletId: btcWallet?.id,
    btcWalletBalance,
  }
}

export default useMainQuery
