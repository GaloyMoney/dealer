import fetch from "cross-fetch"
import { createContext, useContext } from "react"

export const GwwContext = createContext<GwwContextType>({
  state: { path: "/" },
  dispatch: (_action: GwwAction) => {
    // Do nothing
  },
})

export * from "./history"

export const useAppState = () => {
  const { state, dispatch } = useContext<GwwContextType>(GwwContext)

  const request = {
    post: async (
      path: string,
      variables: Record<string, string | number | boolean> = {},
    ) => {
      try {
        const response = await fetch(path, {
          method: "post",
          body: JSON.stringify(variables),
          headers: {
            "Content-Type": "application/json",
            "authorization": state.authToken ? `Bearer ${state.authToken}` : "",
          },
        })

        const data = await response.json()

        return data.error ? new Error(data.error) : data
      } catch (err) {
        return err
      }
    },
  }

  return { state, dispatch, request }
}
