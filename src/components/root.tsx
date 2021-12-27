import { useEffect, useReducer } from "react"

import { GwwContext, history } from "store"
import mainReducer from "store/reducer"
import i18n from "translate"
import RootComponent from "./root-component"

const Root = ({ initialState }: { initialState: InitialState }) => {
  const [state, dispatch] = useReducer(mainReducer, initialState, (initState) => {
    if (initState.defaultLanguage) {
      i18n.locale = initState.defaultLanguage
    }
    return initState
  })

  useEffect(() => {
    const unlisten = history.listen(({ location }) => {
      dispatch({
        type: "navigate",
        path: location.pathname,
        ...(location.state as Record<string, unknown> | null),
      })
    })
    return () => unlisten()
  }, [])

  return (
    <GwwContext.Provider value={{ state, dispatch }}>
      <RootComponent path={state.path} />
    </GwwContext.Provider>
  )
}

export default Root
