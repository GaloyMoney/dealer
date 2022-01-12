import { DocumentNode } from "graphql"

import { ApolloQueryResult, OperationVariables, useApolloClient } from "@apollo/client"
import { useCallback, useState } from "react"

type SendQuery = (
  variables: OperationVariables,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<ApolloQueryResult<any> | { data: undefined; error: unknown }>

const useDelayedQuery = (
  query: DocumentNode,
): [SendQuery, { loading: boolean | undefined }] => {
  const client = useApolloClient()

  const [loading, setLoading] = useState<boolean | undefined>()

  const sendQuery: SendQuery = useCallback(
    async (variables) => {
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
        return { data: undefined, error: err }
      }
    },
    [client, query],
  )

  return [sendQuery, { loading }]
}

export default useDelayedQuery
