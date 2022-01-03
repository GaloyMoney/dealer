import { translate } from "translate"
import useAuthToken from "store/use-auth-token"

import Balance from "./balance"
import Link from "./link"
import Logout from "./logout"
import useMainQuery from "store/use-main-query"

const Header = () => {
  const { hasToken } = useAuthToken()
  const { btcWalletBalance } = useMainQuery()

  return (
    <div className="header">
      <Balance balance={btcWalletBalance} />
      {hasToken ? <Logout /> : <Link to="/login">{translate("Login")}</Link>}
    </div>
  )
}

export default Header
