import useAuthToken from "store/use-auth-token"
import Balance from "./balance"
import Link from "./link"
import Logout from "./logout"

const Header = ({ balance }: { balance: number }) => {
  const { hasToken } = useAuthToken()

  return (
    <div className="header">
      <Balance balance={balance} />
      {hasToken ? <Logout /> : <Link to="/login">Login</Link>}
    </div>
  )
}

export default Header
