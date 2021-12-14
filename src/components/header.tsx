import Balance from "./balance"
import Link from "./link"

const Header = () => {
  return (
    <div className="header">
      <Balance />
      <Link to="/login">Login</Link>
    </div>
  )
}

export default Header
