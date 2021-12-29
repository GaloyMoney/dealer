import { useQuery } from "@apollo/client"

import { setLocale, translate } from "translate"
import QUERY_ME from "store/graphql/query.me"
import useAuthToken from "store/use-auth-token"

import Balance from "./balance"
import Link from "./link"
import Logout from "./logout"

const Header = () => {
  const { hasToken } = useAuthToken()

  const { data } = useQuery(QUERY_ME, {
    variables: { hasToken },
    onCompleted: (completed) => {
      setLocale(completed?.me?.language)
    },
  })

  const me = data?.me
  const balance = hasToken ? me?.defaultAccount?.wallets?.[0]?.balance ?? NaN : 0

  return (
    <div className="header">
      <Balance balance={balance} initialPrice={data?.btcPrice} />
      {hasToken ? <Logout /> : <Link to="/login">{translate("Login")}</Link>}
    </div>
  )
}

export default Header
