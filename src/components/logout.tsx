import { useAppDispatcher, useRequest } from "store"

const Logout = () => {
  const request = useRequest()
  const dispatch = useAppDispatcher()

  const handleLogout: React.MouseEventHandler<HTMLAnchorElement> = async (event) => {
    event.preventDefault()
    await request.post("/api/logout")
    dispatch({ type: "logout" })
  }

  return (
    <a href="/logout" onClick={handleLogout}>
      Logout
    </a>
  )
}

export default Logout
