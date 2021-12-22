import { useAppState } from "store"

import Balance from "./balance"
import Link from "./link"
import Logout from "./logout"

const Header = ({ balance }: { balance: number }) => {
  const { authToken } = useAppState()

  return (
    <div className="header">
      <Balance balance={balance} />
      {authToken ? <Logout /> : <Link to="/login">Login</Link>}
    </div>
  )
}

export default Header
