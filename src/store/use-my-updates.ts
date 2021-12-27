import { useSubscription, useApolloClient, ApolloClient } from "@apollo/client"
import { useMemo, useRef } from "react"

import CACHED_DATA from "store/graphql/query.cached-data"
import SUBSCRIPTION_MY_UPDATES from "./graphql/subscription.my-updates"

const PriceCacheStore = (client: ApolloClient<unknown>) => ({
  read: () => {
    const cachedData = client.readQuery<CachedData>({ query: CACHED_DATA })
    return cachedData?.satPriceInCents
  },
  write: (newPrice: number) =>
    client.writeQuery({ query: CACHED_DATA, data: { satPriceInCents: newPrice } }),
})

const satPriceInCents = (update: PriceData) => {
  if (!update) {
    return NaN
  }
  const { base, offset } = update
  return base / 10 ** offset
}

export const useMyUpdates = (initialPrice: PriceData): UseMyUpdates => {
  const intraLedgerUpdate = useRef<IntraLedgerUpdate | null>(null)
  const lnUpdate = useRef<LnUpdate | null>(null)
  const onChainUpdate = useRef<OnChainUpdate | null>(null)

  const client = useApolloClient()
  const priceCacheStore = PriceCacheStore(client)
  const cachedPrice = useRef(
    satPriceInCents(initialPrice) ?? priceCacheStore.read() ?? NaN,
  )

  const updatePriceCache = (newPrice: number): void => {
    if (cachedPrice.current !== newPrice) {
      priceCacheStore.write(newPrice)
      cachedPrice.current = newPrice
    }
  }

  const { data } = useSubscription(SUBSCRIPTION_MY_UPDATES)

  if (data?.myUpdates?.update) {
    const { type } = data.myUpdates.update
    if (type === "Price") {
      updatePriceCache(satPriceInCents(data.myUpdates.update))
    }
    if (type === "IntraLedgerUpdate") {
      intraLedgerUpdate.current = data.myUpdates.update
    }
    if (type === "LnUpdate") {
      lnUpdate.current = data.myUpdates.update
    }
    if (type === "OnChainUpdate") {
      onChainUpdate.current = data.myUpdates.update
    }
  }

  // The following conversion functions have to be defined here as they they depend on cachedPrice.current

  const satsToUsd = useMemo(() => {
    return Number.isNaN(cachedPrice.current)
      ? null
      : (sats: number) => (sats * cachedPrice.current) / 100
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cachedPrice.current])

  const usdToSats = useMemo(() => {
    return Number.isNaN(cachedPrice.current)
      ? null
      : (usd: number) => (100 * usd) / cachedPrice.current
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cachedPrice.current])

  const currentBalance = data?.myUpdates?.me?.defaultAccount?.wallets?.[0]?.balance ?? NaN

  return {
    satsToUsd,
    usdToSats,
    currentBalance,
    intraLedgerUpdate: intraLedgerUpdate.current,
    lnUpdate: lnUpdate.current,
    onChainUpdate: onChainUpdate.current,
  }
}

export default UseMyUpdates
