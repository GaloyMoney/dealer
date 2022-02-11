import { useEffect, useReducer } from "react"

import { GaloyClient, setLocale } from "@galoymoney/client"

import { GwwContext, history } from "../store"
import mainReducer from "../store/reducer"

import { AuthProvider } from "../components/auth-provider"
import RootComponent from "../components/root-component"

type RootProps = { GwwState: GwwState }

const Root = ({ GwwState }: RootProps) => {
  const [state, dispatch] = useReducer(mainReducer, GwwState, (initState) => {
    setLocale(initState.defaultLanguage)
    return initState
  })

  useEffect(() => {
    const unlisten = history.listen(({ location }) => {
      const props = Object.fromEntries(new URLSearchParams(location.search))

      dispatch({
        type: "update",
        path: location.pathname,
        props,
        ...(location.state as Record<string, unknown> | null),
      })
    })
    return () => unlisten()
  }, [dispatch])

  return (
    <AuthProvider>
      <GwwContext.Provider value={{ state, dispatch }}>
        <RootComponent
          path={state.path}
          key={state.key}
          flowData={state.flowData}
          {...state.props}
        />
      </GwwContext.Provider>
    </AuthProvider>
  )
}

type SSRootProps = {
  client: GaloyClient<unknown>
  galoyJwtToken?: string
  GwwState: GwwState
  flowData?: KratosFlowData
}

export const SSRRoot = ({ client, GwwState, galoyJwtToken }: SSRootProps) => {
  const [state, dispatch] = useReducer(mainReducer, GwwState, (initState) => {
    setLocale(initState.defaultLanguage)
    return initState
  })

  return (
    <AuthProvider galoyClient={client} galoyJwtToken={galoyJwtToken}>
      <GwwContext.Provider value={{ state, dispatch }}>
        <RootComponent path={state.path} flowData={state.flowData} {...state.props} />
      </GwwContext.Provider>
    </AuthProvider>
  )
}

export default Root
