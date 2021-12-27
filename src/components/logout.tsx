import { useApolloClient } from "@apollo/client"
import { useAppDispatcher, useRequest } from "store"

const Logout = () => {
  const client = useApolloClient()
  const request = useRequest()
  const dispatch = useAppDispatcher()

  const handleLogout: React.MouseEventHandler<HTMLAnchorElement> = async (event) => {
    event.preventDefault()
    await request.post("/api/logout")
    client.clearStore()
    dispatch({ type: "logout" })
  }

  return (
    <a href="/logout" onClick={handleLogout}>
      Logout
    </a>
  )
}

export default Logout
