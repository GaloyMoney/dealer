import Home from "../components/pages/home"
import Login from "../components/pages/login"
import Send from "../components/pages/send"
import Receive from "../components/pages/receive"

export const SupportedRoutes = ["/", "/login", "/scan", "/send", "/receive"] as const

// Note: The component property is skipped by the serialize function
// It's only used on the front-end
const appRoutes: AppRoutes = {
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
}

export default appRoutes
