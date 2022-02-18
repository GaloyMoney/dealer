import Contacts from "../components/pages/contacts"
import Home from "../components/pages/home"
import Login from "../components/pages/login"
import Receive from "../components/pages/receive"
import Send from "../components/pages/send"
import Settings from "../components/pages/settings"
import Transactions from "../components/pages/transactions"

import Register from "../components/pages/register"
import config from "../store/config"

// Note: The component property is skipped by the serialize function
// It's only used on the front-end
const appRoutesDef = {
  "/": {
    component: Home,
    title: `${config.walletName} Web Wallet`,
  },
  "/login": {
    component: Login,
    title: `Login to ${config.walletName} Web Wallet`,
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

export type SupportedRoutes = keyof typeof appRoutesDef
type AppRoutes = Record<RoutePath, { component: LayoutComponent<unknown>; title: string }>

export const appRoutes: AppRoutes = appRoutesDef as unknown as AppRoutes

export const checkRoute = (path: string): RoutePath | Error => {
  if (appRoutes[path as never]) {
    return path as RoutePath
  }
  return new Error("Invaild route path")
}

const authRoutesDef = {
  "/register/email": {
    component: Register,
    title: "Register with Email",
  },
}

export type SupportedAuthRoutes = keyof typeof authRoutesDef

export const checkAuthRoute = (path: string): AuthRoutePath | Error => {
  if (authRoutesDef[path as never]) {
    return path as AuthRoutePath
  }
  return new Error("Invaild auth route path")
}

type AuthRoutes = Record<
  AuthRoutePath,
  {
    component: (props: { flowData?: KratosFlowData }) => JSX.Element
    title: string
  }
>

export const authRoutes: AuthRoutes = authRoutesDef
