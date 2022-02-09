import Home from "../components/pages/home"
import Login from "../components/pages/login"
import Send from "../components/pages/send"
import Receive from "../components/pages/receive"
import Contacts from "../components/contacts"
import Transactions from "../components/pages/transactions"

// Note: The component property is skipped by the serialize function
// It's only used on the front-end
const appRoutes = {
  "/": {
    component: Home,
    title: "Galoy Web Wallet",
  },
  "/login": {
    component: Login,
    title: "Login to Galoy Web Wallet",
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
}

export type SupportedRoutes = keyof typeof appRoutes

export const checkRoute = (path: string): RoutePath | Error => {
  if (appRoutes[path as never]) {
    return path as RoutePath
  }
  return new Error("Invaild route path")
}

type AppRoutes = Record<
  RoutePath,
  {
    component: (props: Record<string, unknown>) => JSX.Element
    title: string
  }
>

export default appRoutes as unknown as AppRoutes
