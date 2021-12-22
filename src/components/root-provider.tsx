import { createClient, Provider, dedupExchange, cacheExchange, fetchExchange } from "urql"

import config from "server/config"
import { ssr, useAppState } from "store"

import RootComponent from "./root-component"
import { useMemo } from "react"

const RootProvider = () => {
  const { path, authToken } = useAppState()
  const client = useMemo(() => {
    return createClient({
      url: config.graphqlUri,
      suspense: !config.isBrowser,
      exchanges: [dedupExchange, cacheExchange, ssr, fetchExchange],
      fetchOptions: () => {
        return {
          headers: { authorization: authToken ? `Bearer ${authToken}` : "" },
        }
      },
    })
  }, [authToken])

  return (
    <Provider value={client}>
      <RootComponent path={path} />
    </Provider>
  )
}

export default RootProvider
