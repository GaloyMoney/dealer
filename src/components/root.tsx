import { useEffect, useReducer } from "react"

import { GwwContext, history } from "store"
import mainReducer from "store/reducer"

import RootProvider from "./root-provider"

const Root = ({ initialState }: { initialState: InitialState }) => {
  const [state, dispatch] = useReducer(mainReducer, initialState)

  useEffect(() => {
    const unlisten = history.listen(({ location }) => {
      dispatch({
        type: "state",
        path: location.pathname,
        ...(location.state as Record<string, unknown> | null),
      })
    })
    return () => unlisten()
  }, [])

  return (
    <GwwContext.Provider value={{ state, dispatch }}>
      <RootProvider />
    </GwwContext.Provider>
  )
}

export default Root
