import { useEffect, useReducer } from "react"

import { GaloyClient, setLocale } from "@galoymoney/client"

import { GwwContext, history } from "store/index"
import mainReducer from "store/reducer"

import { AuthProvider } from "components/auth-provider"
import RootComponent from "components/root-component"

type RootFCT = React.FC<{ GwwState: GwwState }>

const Root: RootFCT = ({ GwwState }) => {
  const [state, dispatch] = useReducer(mainReducer, GwwState, (initState) => {
    setLocale(initState.defaultLanguage)
    return initState
  })

  useEffect(() => {
    const removeHistoryListener = history.listen(({ location }) => {
      const props = Object.fromEntries(new URLSearchParams(location.search))

      dispatch({
        type: "update-with-key",
        path: location.pathname,
        props,
        ...(location.state as Record<string, unknown> | null),
      })
    })

    return () => {
      removeHistoryListener()
    }
  }, [dispatch])

  return (
    <AuthProvider>
      <GwwContext.Provider value={{ state, dispatch }}>
        <RootComponent
          key={state.key}
          path={state.path}
          flowData={state.flowData}
          {...state.props}
        />
      </GwwContext.Provider>
    </AuthProvider>
  )
}

type SSRRootFCT = React.FC<{
  client: GaloyClient<unknown>
  galoyJwtToken?: string
  GwwState: GwwState
  flowData?: KratosFlowData
}>

export const SSRRoot: SSRRootFCT = ({ client, GwwState, galoyJwtToken }) => {
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
