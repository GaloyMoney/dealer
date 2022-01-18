import { DocumentNode } from "graphql"

import { ApolloQueryResult, OperationVariables, useApolloClient } from "@apollo/client"
import { useCallback, useState } from "react"

const useDelayedQuery = <T = any>(
  query: DocumentNode,
): [
  (variables: OperationVariables) => Promise<ApolloQueryResult<T | undefined>>,
  { loading: boolean | undefined },
] => {
  const client = useApolloClient()

  const [loading, setLoading] = useState<boolean | undefined>()

  const sendQuery = useCallback(
    async (variables: OperationVariables): Promise<ApolloQueryResult<T | undefined>> => {
      setLoading(true)
      try {
        const result = await client.query({
          query,
          variables,
        })
        setLoading(false)
        return result
      } catch (err) {
        setLoading(false)
        return { data: undefined, error: err } as ApolloQueryResult<undefined>
      }
    },
    [client, query],
  )

  return [sendQuery, { loading }]
}

export default useDelayedQuery
