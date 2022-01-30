import { useEffect, useMemo, useReducer } from "react"
import { useErrorHandler } from "react-error-boundary"

import { GaloyClient, GaloyProvider, postRequest, setLocale } from "@galoymoney/client"

import { createClient, GwwContext, history } from "../store"
import mainReducer from "../store/reducer"

import RootComponent from "../components/root-component"

type RootProps = { GwwState: GwwState }

const Root = ({ GwwState }: RootProps) => {
  const handleError = useErrorHandler()
  const [state, dispatch] = useReducer(mainReducer, GwwState, (initState) => {
    setLocale(initState.defaultLanguage)
    return initState
  })

  const galoyClient = useMemo(
    () =>
      createClient({
        authToken: state?.authToken,
        onError: ({ graphQLErrors, networkError }) => {
          if (graphQLErrors) {
            console.debug("[GraphQL errors]:", graphQLErrors)
          }
          if (networkError) {
            console.debug("[Network error]:", networkError)
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
        type: "update",
        path: location.pathname,
        ...(location.state as Record<string, unknown> | null),
      })
    })
    return () => unlisten()
  }, [state?.authToken])

  return (
    <GaloyProvider client={galoyClient}>
      <GwwContext.Provider value={{ state, dispatch }}>
        <RootComponent path={state.path} key={state.key} />
      </GwwContext.Provider>
    </GaloyProvider>
  )
}

type SSRootProps = {
  client: GaloyClient<unknown>
  GwwState: GwwState
}

export const SSRRoot = ({ client, GwwState }: SSRootProps) => {
  const [state, dispatch] = useReducer(mainReducer, GwwState, (initState) => {
    setLocale(initState.defaultLanguage)
    return initState
  })

  return (
    <GaloyProvider client={client}>
      <GwwContext.Provider value={{ state, dispatch }}>
        <RootComponent path={state.path} />
      </GwwContext.Provider>
    </GaloyProvider>
  )
}

export default Root
