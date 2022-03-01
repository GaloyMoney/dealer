import { useState } from "react"

import { translate } from "@galoymoney/client"
import { Icon } from "@galoymoney/react"

import useMainQuery from "hooks/use-main-query"
import { useAuthContext } from "store/use-auth-context"

import Balance from "components/balance"
import Link from "components/link"
import Logout from "components/logout"

const LoginLink = () => (
  <Link to="/login">
    <Icon name="login" />
    <span className="name">{translate("Login")}</span>
  </Link>
)

const headerNavPages = ["home", "send-bitcoin", "receive-bitcoin"] as const

type Page = typeof headerNavPages[number] | "contacts" | "transactions" | "settings"

type FCT = React.FC<{ page: Page }>

const Header: FCT = ({ page }) => {
  const { isAuthenticated } = useAuthContext()
  const { btcWalletBalance } = useMainQuery()
  const [showMenu, setShowMenu] = useState(false)

  const handleMenuClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    setShowMenu((menuStatus) => !menuStatus)
  }

  const handleMenuClose: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    setShowMenu(false)
  }

  const showHeaderNav = page && headerNavPages.includes(page)

  return (
    <div className={`header-container ${page}-header`}>
      <div className="header">
        <Balance balance={btcWalletBalance} />
        <div className="links">
          {page !== "home" && (
            <>
              <Link to="/">
                <Icon name="home" />
                <span className="name">{translate("Home")}</span>
              </Link>
              <div className="separator">|</div>
            </>
          )}
          {isAuthenticated ? <Logout /> : <LoginLink />}
          <div className="separator">|</div>
          <div className="menu-icon" onClick={handleMenuClick}>
            <Icon name="menu" />
          </div>
        </div>
      </div>

      {showHeaderNav && (
        <div className="header-nav">
          <Link to="/scan">
            <Icon name="qrcode" />
            {translate("Scan QR code")}
          </Link>
          <Link to="/send" className={`${page === "send-bitcoin" ? "active" : "link"}`}>
            <Icon name="send" />
            {translate("Send Bitcoin")}
          </Link>
          <Link
            to="/receive"
            className={`${page === "receive-bitcoin" ? "active" : "link"}`}
          >
            <Icon name="receive" />
            {translate("Receive Bitcoin")}
          </Link>
        </div>
      )}

      {showMenu && (
        <div className="menu">
          <div className="close" onClick={handleMenuClose}>
            <Icon name="close" />
          </div>

          <Link to="/">
            <Icon name="home" />
            {translate("Home")}
          </Link>

          <Link to="/contacts">
            <Icon name="people" />
            {translate("Contacts")}
          </Link>

          <Link to="/settings">
            <Icon name="settings" />
            {translate("Settings")}
          </Link>

          {isAuthenticated ? <Logout /> : <LoginLink />}
        </div>
      )}
    </div>
  )
}

export default Header
