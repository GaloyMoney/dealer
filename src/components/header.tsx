import { translate } from "@galoymoney/client"

import useAuthToken from "store/use-auth-token"
import useMainQuery from "store/use-main-query"

import Balance from "./balance"
import Link from "./link"
import Logout from "./logout"

type Props = {
  page: "home" | "send-bitcoin" | "receive-bitcoin"
}

const Header = ({ page }: Props) => {
  const { hasToken } = useAuthToken()
  const { btcWalletBalance } = useMainQuery()

  return (
    <>
      <div className="header">
        <Balance balance={btcWalletBalance} />
        {hasToken ? <Logout /> : <Link to="/login">{translate("Login")}</Link>}
      </div>
      {page && (
        <div className="header-nav">
          <div className="tabs">
            <Link to="/send">
              <div className={`tab ${page === "send-bitcoin" ? "active" : "link"}`}>
                {translate("Send Bitcoin")}
              </div>
            </Link>
            <Link to="/receive">
              <div className={`tab ${page === "receive-bitcoin" ? "active" : "link"}`}>
                {translate("Receive Bitcoin")}
              </div>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
