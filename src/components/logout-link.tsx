import { useResetClient, translate } from "@galoymoney/client"
import { Icon } from "@galoymoney/react"

import { useAuthContext, NoPropsFCT } from "store/index"

const LogoutLink: NoPropsFCT = () => {
  const { setAuthSession } = useAuthContext()

  const resetClient = useResetClient()
  const handleLogout: React.MouseEventHandler<HTMLAnchorElement> = async (event) => {
    event.preventDefault()
    resetClient()
    setAuthSession(null)
    window.location.href = "/logout"
  }

  return (
    <a href="/logout" onClick={handleLogout}>
      <Icon name="logout" />
      <span className="name">{translate("Logout")}</span>
    </a>
  )
}

export default LogoutLink
