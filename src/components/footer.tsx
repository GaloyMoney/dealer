import { Icon } from "@galoymoney/react"
import Link from "./link"

type Page = "home" | "settings" | "transactions"

const Footer: React.FC<{ page?: Page }> = function Header({ page }) {
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
          <Icon name="person" />
        </div>
      </div>
    </div>
  )
}

export default Footer
