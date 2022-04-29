import { createContext, useContext } from "react"

import {
  createGaloyClient,
  createGaloyServerAdminClient,
  createGaloyServerClient,
  postRequest,
} from "@galoymoney/client"

import { useAuthContext } from "store/auth-context"
import { config } from "store/config"
import { GwwActionType, GwwContextType } from "store/index"

export const GwwContext = createContext<GwwContextType>({
  state: { key: 0, path: "/" },
  dispatch: (_action: GwwActionType) => {
    // Do nothing
  },
})

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

export const createAdminClient = createGaloyServerAdminClient({ config })
