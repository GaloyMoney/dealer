import history from "store/history"

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

export default Link
