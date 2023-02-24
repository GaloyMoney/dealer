import { createContext, useContext } from "react"

import {
  createGaloyClient,
  createGaloyServerAdminClient,
  createGaloyServerClient,
} from "@galoymoney/client"

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

export const createClient = config.isBrowser
  ? createGaloyClient({ config })
  : createGaloyServerClient({ config })

export const createAdminClient = createGaloyServerAdminClient({ config })
