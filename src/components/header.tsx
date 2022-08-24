import { useState } from "react"

import useMainQuery from "hooks/use-main-query"
import { translate, useAuthContext, useAppState } from "store/index"

import Balance from "components/balance"
import Link from "components/link"
import LoginLink from "components/login-link"
import LogoutLink from "components/logout-link"
import DiscardableMessage from "components/discardable-message"
import Icon from "components/icon"

const headerNavPages = ["home"] as const

type Page =
  | typeof headerNavPages[number]
  | "send-bitcoin"
  | "receive-bitcoin"
  | "contacts"
  | "transactions"
  | "settings"

type FCT = React.FC<{ page: Page }>

const Header: FCT = ({ page }) => {
  const { isAuthenticated } = useAuthContext()
  const { emailVerified } = useAppState()
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

  const showVerifiedConfirmation = page === "home" && emailVerified

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
          {isAuthenticated ? <LogoutLink /> : <LoginLink />}
          <div className="separator">|</div>
          <div className="menu-icon" onClick={handleMenuClick}>
            <Icon name="menu" />
          </div>
        </div>
      </div>

      {showVerifiedConfirmation && <DiscardableMessage type="emailVerified" />}

      {showHeaderNav && (
        <div className="header-nav">
          <Link to="/scan">
            <Icon name="qrcode" />
            {translate("Scan QR code")}
          </Link>
          <Link to="/send" className="link send">
            <Icon name="send" />
            {translate("Send Bitcoin")}
          </Link>
          <Link to="/receive" className="link receive">
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

          {isAuthenticated ? <LogoutLink /> : <LoginLink />}
        </div>
      )}
    </div>
  )
}

export default Header
