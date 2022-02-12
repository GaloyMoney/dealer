import { history } from "../store"

type Props = {
  to: RoutePath | AuthRoutePath
  className?: string
  children: React.ReactNode
}

const Link = ({ to, className, children }: Props) => {
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

export const ButtonLink = ({ to, className, children }: Props) => {
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
