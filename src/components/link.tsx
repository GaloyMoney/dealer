import * as React from "react"
import { checkAuthRoute, ValidPath } from "server/routes"
import config from "store/config"
import { history } from "store/index"

const navigateTo = (to: string) => {
  const authRoute = checkAuthRoute(to)
  if (authRoute instanceof Error || !config.kratosFeatureFlag) {
    history.push(to)
  } else {
    window.location.href = to
  }
}

type FCT = React.FC<{
  to: ValidPath
  className?: string
  children: React.ReactNode
}>

const Link: FCT = ({ to, className, children }) => {
  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (!event.ctrlKey && !event.metaKey) {
      event.preventDefault()
    }
    navigateTo(to)
  }
  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}

export const ButtonLink: FCT = ({ to, className, children }) => {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault()
    navigateTo(to)
  }
  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  )
}

export default Link
