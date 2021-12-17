import fetch from "cross-fetch"
import { useContext } from "react"
import GwwContext from "store"

const Logout = () => {
  const { dispatch } = useContext<GwwContextType>(GwwContext)

  const handleLogout: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault()
    fetch("/api/logout", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
    })
    dispatch({ type: "logout" })
  }

  return (
    <a href="/logout" onClick={handleLogout}>
      Logout
    </a>
  )
}

export default Logout
