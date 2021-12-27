import { useEffect, useReducer } from "react"

import { GwwContext, history } from "store"
import mainReducer from "store/reducer"
import RootComponent from "./root-component"

const Root = ({ initialState }: { initialState: InitialState }) => {
  const [state, dispatch] = useReducer(mainReducer, initialState)

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
