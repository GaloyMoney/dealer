import { useApolloClient } from "@apollo/client"
import { history, useRequest } from "store"
import { translate } from "translate"

const Logout = () => {
  const client = useApolloClient()
  const request = useRequest()

  const handleLogout: React.MouseEventHandler<HTMLAnchorElement> = async (event) => {
    event.preventDefault()
    await request.post("/api/logout")
    client.clearStore()
    history.push("/", { authToken: undefined })
  }

  return (
    <a href="/logout" onClick={handleLogout}>
      {translate("Logout")}
    </a>
  )
}

export default Logout
