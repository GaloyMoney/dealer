import { createContext, useContext } from "react"

import {
  createGaloyClient,
  createGaloyServerClient,
  postRequest,
} from "@galoymoney/client"

import useAuthToken from "./use-auth-token"
import config from "./config"

export const GwwContext = createContext<GwwContextType>({
  state: { path: "/", key: 0 },
  dispatch: (_action: GwwAction) => {
    // Do nothing
  },
})

export * from "./history"
export * from "./currencies"

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

  return {
    post: postRequest(authToken),
  }
}

export const createClient = config.isBrowser
  ? createGaloyClient({ config, initData: window.__G_DATA.ssrData })
  : createGaloyServerClient({ config })
