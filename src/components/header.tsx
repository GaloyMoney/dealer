import { translate } from "@galoymoney/client"

import useMainQuery from "../hooks/use-main-query"
import useAuthToken from "../store/use-auth-token"

import Balance from "./balance"
import Link from "./link"
import Logout from "./logout"

type Props = {
  page?: "send-bitcoin" | "receive-bitcoin" | "home"
}

const Header = ({ page }: Props) => {
  const { hasToken } = useAuthToken()
  const { btcWalletBalance } = useMainQuery()

  return (
    <div className={`header-container ${page}`}>
      <div className="header">
        <Balance balance={btcWalletBalance} />
        <div className="links">
          {page !== "home" && (
            <>
              <Link to="/">{translate("Home")}</Link>
              <div className="separator">|</div>
            </>
          )}
          {hasToken ? <Logout /> : <Link to="/login">{translate("Login")}</Link>}
        </div>
      </div>
      {page && (
        <div className="header-nav">
          <Link to="/scan">
            <i aria-hidden className="fas fa-qrcode"></i>
            {translate("Scan QR code")}
          </Link>
          <Link to="/send" className={`${page === "send-bitcoin" ? "active" : "link"}`}>
            <i aria-hidden className="fas fa-paper-plane"></i>
            {translate("Send Bitcoin")}
          </Link>
          <Link
            to="/receive"
            className={`${page === "receive-bitcoin" ? "active" : "link"}`}
          >
            <i aria-hidden className="far fa-dot-circle"></i>
            {translate("Receive Bitcoin")}
          </Link>
        </div>
      )}
    </div>
  )
}

export default Header
