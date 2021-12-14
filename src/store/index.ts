import { createContext } from "react"

const GwwContext = createContext<GwwContextType>({
  state: {},
  dispatch: (_action: GwwAction) => {
    // Do nothing
  },
})

export default GwwContext
