import { useEffect, useMemo, useReducer } from "react"
import { ApolloClient, ApolloProvider } from "@apollo/client"

import { createApolloClient, GwwContext, history, postRequest } from "store"
import mainReducer from "store/reducer"
import { setLocale } from "translate"

import RootComponent from "../components/root-component"
import { useErrorHandler } from "react-error-boundary"

type RootProps = { initialState: InitialState }

const Root = ({ initialState }: RootProps) => {
  const handleError = useErrorHandler()
  const [state, dispatch] = useReducer(mainReducer, initialState, (initState) => {
    setLocale(initState.defaultLanguage)
    return initState
  })

  const apolloClient = useMemo(
    () =>
      createApolloClient(state?.authToken, {
        onError: ({ graphQLErrors, networkError }) => {
          if (graphQLErrors) {
            graphQLErrors.forEach((error) => {
              console.info(`[GraphQL error]: ${JSON.stringify(error)}`)
            })
          }
          if (networkError) {
            console.info(`[Network error]: ${networkError}`)
            if (
              "result" in networkError &&
              networkError.result.errors?.[0]?.code === "INVALID_AUTHENTICATION"
            ) {
              postRequest(state.authToken)("/api/logout").then(
                () => (document.location = "/"),
              )
            } else {
              handleError(networkError)
            }
          }
        },
      }),
    [handleError, state?.authToken],
  )

  useEffect(() => {
    const unlisten = history.listen(({ location }) => {
      dispatch({
        type: "navigate",
        path: location.pathname,
        ...(location.state as Record<string, unknown> | null),
      })
    })
    return () => unlisten()
  }, [state?.authToken])

  return (
    <ApolloProvider client={apolloClient}>
      <GwwContext.Provider value={{ state, dispatch }}>
        <RootComponent path={state.path} />
      </GwwContext.Provider>
    </ApolloProvider>
  )
}

type SSRootProps = {
  client: ApolloClient<unknown>
  initialState: InitialState
}

export const SSRRoot = ({ client, initialState }: SSRootProps) => {
  const [state, dispatch] = useReducer(mainReducer, initialState, (initState) => {
    setLocale(initState.defaultLanguage)
    return initState
  })

  return (
    <ApolloProvider client={client}>
      <GwwContext.Provider value={{ state, dispatch }}>
        <RootComponent path={state.path} />
      </GwwContext.Provider>
    </ApolloProvider>
  )
}

export default Root
