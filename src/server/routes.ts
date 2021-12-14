import Home from "../components/home"
import Login from "../components/login"

export const SupportedRoutes = ["/", "/login"] as const

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
}

export default appRoutes
