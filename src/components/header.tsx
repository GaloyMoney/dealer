import { translate } from "@galoymoney/client"
import { useState } from "react"

import useMainQuery from "../hooks/use-main-query"
import { useAuthContext } from "../store/use-auth-context"

import Balance from "./balance"
import Link from "./link"
import Logout from "./logout"

const LoginLink = () => (
  <Link to="/login">
    <i aria-hidden className="fas fa-sign-in-alt" />
    <span className="name">{translate("Login")}</span>
  </Link>
)

type Props = {
  page?: "home" | "send-bitcoin" | "receive-bitcoin" | "contacts" | "transactions"
}

const Header = ({ page }: Props) => {
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

  const showHeaderNav = page && ["home", "send-bitcoin", "recevei-bitcoin"].includes(page)

  return (
    <div className={`header-container ${page}-header`}>
      <div className="header">
        <Balance balance={btcWalletBalance} />
        <div className="links">
          {page !== "home" && (
            <>
              <Link to="/">
                <i aria-hidden className="fas fa-home" />
                <span className="name">{translate("Home")}</span>
              </Link>
              <div className="separator">|</div>
            </>
          )}
          {isAuthenticated ? <Logout /> : <LoginLink />}
          <div className="separator">|</div>
          <div className="menu-icon" onClick={handleMenuClick}>
            <i aria-hidden className="fas fa-bars" />
          </div>
        </div>
      </div>
      {showHeaderNav && (
        <div className="header-nav">
          <Link to="/scan">
            <i aria-hidden className="fas fa-qrcode" />
            {translate("Scan QR code")}
          </Link>
          <Link to="/send" className={`${page === "send-bitcoin" ? "active" : "link"}`}>
            <i aria-hidden className="fas fa-paper-plane" />
            {translate("Send Bitcoin")}
          </Link>
          <Link
            to="/receive"
            className={`${page === "receive-bitcoin" ? "active" : "link"}`}
          >
            <i aria-hidden className="far fa-dot-circle" />
            {translate("Receive Bitcoin")}
          </Link>
        </div>
      )}

      {showMenu && (
        <div className="menu">
          <div className="close" onClick={handleMenuClose}>
            <i aria-hidden className="fas fa-times" />
          </div>

          <Link to="/">
            <i aria-hidden className="fas fa-home" />
            {translate("Home")}
          </Link>

          <Link to="/contacts">
            <i aria-hidden className="fas fa-user-friends" />
            {translate("Contacts")}
          </Link>

          {isAuthenticated ? <Logout /> : <LoginLink />}
        </div>
      )}
    </div>
  )
}

export default Header
