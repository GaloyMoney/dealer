import fetch from "cross-fetch"
import { createContext, useContext } from "react"

import useAuthToken from "./use-auth-token"

export const GwwContext = createContext<GwwContextType>({
  state: { path: "/" },
  dispatch: (_action: GwwAction) => {
    // Do nothing
  },
})

export * from "./history"

export const useAppState = () => {
  const { state } = useContext<GwwContextType>(GwwContext)
  return state
}

export const useAppDispatcher = () => {
  const { dispatch } = useContext<GwwContextType>(GwwContext)
  return dispatch
}

export const useRequest = () => {
  const { authToken } = useAuthToken()

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
            "authorization": authToken ? `Bearer ${authToken}` : "",
          },
        })

        const data = await response.json()

        return data.error ? new Error(data.error) : data
      } catch (err) {
        return err
      }
    },
  }

  return request
}
