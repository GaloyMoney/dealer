import { history } from "store"

type Props = {
  to: RoutePath
  children: React.ReactNode
}

const Link = ({ to, children }: Props) => {
  const navigate: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (!event.ctrlKey && !event.metaKey) {
      event.preventDefault()
    }
    history.push(to)
  }
  return (
    <a href={to} onClick={navigate}>
      {children}
    </a>
  )
}

export const ButtonLink = ({ to, children }: Props) => {
  const navigate: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!event.ctrlKey && !event.metaKey) {
      event.preventDefault()
    }
    history.push(to)
  }
  return <button onClick={navigate}>{children}</button>
}

export default Link
