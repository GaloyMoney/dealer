import { useResetClient, translate } from "@galoymoney/client"
import { Icon } from "@galoymoney/react"

import { history, useRequest } from "store/index"
import { useAuthContext } from "store/use-auth-context"

const Logout: NoPropsFCT = () => {
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
      <Icon name="logout" />
      <span className="name">{translate("Logout")}</span>
    </a>
  )
}

export default Logout
