import { useAppState } from "store"

const Logout = () => {
  const { dispatch, request } = useAppState()

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
