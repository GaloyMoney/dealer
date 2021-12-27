import { ApolloClient, InMemoryCache } from "@apollo/client"
import { useAppState } from "store"
import CACHED_DATA from "./graphql/query.cached-data"

export const getCachedAuthToken = (cache: InMemoryCache) =>
  cache.readQuery<{ authToken: string }>({ query: CACHED_DATA })

export const setCachedAuthToken =
  (client: ApolloClient<unknown>) => (newAuthToken: string | undefined) =>
    client.writeQuery({ query: CACHED_DATA, data: { authToken: newAuthToken } })

const useAuthToken: UseAuthTokenFunction = () => {
  const { authToken } = useAppState()

  return {
    authToken,
    hasToken: Boolean(authToken),
  }
}

export default useAuthToken
