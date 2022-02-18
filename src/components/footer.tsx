import { Icon } from "@galoymoney/react"
import { useAuthContext } from "../store/use-auth-context"
import Link from "./link"

type Page = "home" | "settings" | "transactions"

const Footer: React.FC<{ page?: Page }> = function Header({ page }) {
  const { isAuthenticated } = useAuthContext()
  return (
    <div className={`footer ${page}-footer`}>
      <div className="nav-icons">
        <div className="tab">
          <Link to="/">
            <Icon name="home" />
          </Link>
        </div>
        <div className="tab">
          <Link to="/transactions">
            <Icon name="history" />
          </Link>
        </div>
        <div className="tab disabled">
          <Icon name="bitcoin" />
        </div>
        <div className="tab disabled">
          {isAuthenticated ? (
            <Icon name="person" />
          ) : (
            <Link to="/login">
              <Icon name="person" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Footer
