import { useResetClient, translate } from "@galoymoney/client"

import { history, useRequest } from "../store"
import { useAuthContext } from "../store/use-auth-context"

const Logout = () => {
  const request = useRequest()
  const { setAuthSession } = useAuthContext()

  const resetClient = useResetClient()
  const handleLogout: React.MouseEventHandler<HTMLAnchorElement> = async (event) => {
    event.preventDefault()
    await request.post("/api/logout")
    resetClient()
    setAuthSession(null)
    history.push("/", { galoyJwtToken: undefined })
  }

  return (
    <a href="/logout" onClick={handleLogout}>
      <i aria-hidden className="fas fa-sign-out-alt" />
      <span className="name">{translate("Logout")}</span>
    </a>
  )
}

export default Logout
