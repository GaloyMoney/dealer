import React from "react"

import config from "store/config"

import Contacts from "components/pages/contacts"
import Home from "components/pages/home"
import LoginEmail from "components/pages/login-email"
import LoginPhone from "components/pages/login-phone"
import Receive from "components/pages/receive"
import Recovery from "components/pages/recovery"
import Register from "components/pages/register"
import Send from "components/pages/send"
import Settings from "components/pages/settings"
import Transactions from "components/pages/transactions"

// Note: The component property is skipped by the serialize function
// It's only used on the front-end
const appRoutesDef = {
  "/": {
    component: Home,
    title: `${config.walletName} Web Wallet`,
  },
  "/send": {
    component: Send,
    title: "Send Bitcoin",
  },
  "/scan": {
    component: Send,
    title: "Send Bitcoin",
  },
  "/receive": {
    component: Receive,
    title: "Receive Bitcoin",
  },
  "/contacts": {
    component: Contacts,
    title: "Contacts",
  },
  "/transactions": {
    component: Transactions,
    title: "Transactions with Contact",
  },
  "/settings": {
    component: Settings,
    title: "Settings",
  },
}

// Allow SMS login without kratos
if (!config.kratosFeatureFlag) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(appRoutesDef as any)["/login"] = {
    component: LoginPhone,
    title: `Login to ${config.walletName} Web Wallet`,
  }
}

export type SupportedRoutes = keyof typeof appRoutesDef
export const checkRoute = (path: string): RoutePath | Error => {
  if (appRoutesDef[path as never]) {
    return path as RoutePath
  }
  return new Error("Invalid route path")
}
type AppRoutes = Record<RoutePath, { component: React.FC<unknown>; title: string }>
export const appRoutes: AppRoutes = appRoutesDef as unknown as AppRoutes

const authRoutesDef = {
  "/register": {
    component: Register,
    title: `Create new account for ${config.walletName} Web Wallet`,
  },
  "/login": {
    component: LoginEmail,
    title: `Login to ${config.walletName} Web Wallet`,
  },
  "/recovery": {
    component: Recovery,
    title: `Recover your ${config.walletName} Web Wallet`,
  },
}

export type SupportedAuthRoutes = keyof typeof authRoutesDef
export const checkAuthRoute = (path: string): AuthRoutePath | Error => {
  if (authRoutesDef[path as never]) {
    return path as AuthRoutePath
  }
  return new Error("Invalid auth route path")
}
type AuthRoutes = Record<
  AuthRoutePath,
  { component: React.FC<{ flowData?: KratosFlowData }>; title: string }
>
export const authRoutes: AuthRoutes = authRoutesDef
