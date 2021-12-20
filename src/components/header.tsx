import { useAppState } from "store"
import Balance from "./balance"
import Link from "./link"
import Logout from "./logout"

const Header = ({ balance }: { balance: number }) => {
  const { state } = useAppState()

  return (
    <div className="header">
      <Balance balance={balance} />
      {state.authToken ? <Logout /> : <Link to="/login">Login</Link>}
    </div>
  )
}

export default Header
