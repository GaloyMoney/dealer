import { createContext, useContext } from "react"

import {
  createGaloyClient,
  createGaloyServerClient,
  postRequest,
} from "@galoymoney/client"

import { useAuthContext } from "./use-auth-context"
import config from "./config"

export const GwwContext = createContext<GwwContextType>({
  state: { key: 0, path: "/" },
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
  const { galoyJwtToken } = useAuthContext()

  return {
    post: postRequest(galoyJwtToken),
  }
}

export const createClient = config.isBrowser
  ? createGaloyClient({ config, initData: window.__G_DATA.ssrData })
  : createGaloyServerClient({ config })
