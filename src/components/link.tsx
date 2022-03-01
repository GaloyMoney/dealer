import { history } from "store/index"

type FCT = React.FC<{
  to: RoutePath | AuthRoutePath
  className?: string
}>

const Link: FCT = ({ to, className, children }) => {
  const navigate: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (!event.ctrlKey && !event.metaKey) {
      event.preventDefault()
    }
    history.push(to)
  }
  return (
    <a href={to} onClick={navigate} className={className}>
      {children}
    </a>
  )
}

export const ButtonLink: FCT = ({ to, className, children }) => {
  const navigate: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!event.ctrlKey && !event.metaKey) {
      event.preventDefault()
    }
    history.push(to)
  }
  return (
    <button onClick={navigate} className={className}>
      {children}
    </button>
  )
}

export default Link
