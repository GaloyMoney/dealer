import history from "store/history"
import { useContext } from "react"

import GwwContext from "../store"

type Props = {
  to: RoutePath
  children: React.ReactNode
}

const Link = ({ to, children }: Props) => {
  const { dispatch } = useContext<GwwContextType>(GwwContext)
  const navigate: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (!event.ctrlKey && !event.metaKey) {
      event.preventDefault()
    }
    dispatch({ type: "navigateTo", path: to })
    history.push(to, { rootComponentPath: to })
  }
  return (
    <a href={to} onClick={navigate}>
      {children}
    </a>
  )
}

export default Link
