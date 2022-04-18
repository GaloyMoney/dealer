import * as React from "react"

import { Network, NormalizedCacheObject } from "@galoymoney/client"

import { GwwStateType } from "./reducer"

// Glabol

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ReadonlyArray<T> {
    includes<S, R extends `${Extract<S, string>}`>(
      this: ReadonlyArray<R>,
      searchElement: S,
      fromIndex?: number,
    ): searchElement is R & S
  }

  interface Window {
    __G_DATA: {
      GwwState: GwwStateType
      ssrData: NormalizedCacheObject
      GwwConfig: {
        walletName: string
        walletTheme: string
        supportEmail: string
        shareUri: string
        graphqlUri: string
        graphqlSubscriptionUri: string
        network: Network
        authEndpoint: string
        kratosFeatureFlag: boolean
        kratosBrowserUrl: string
        galoyAuthEndpoint: string
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initGeetest: (...args: any[]) => void
  }
}

// Shared types

export type NoPropsFCT = React.FC<Record<string, never>>
export type ChildrenFCT = React.FC<{ children: React.ReactNode }>
