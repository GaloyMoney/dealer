import { translate } from "store/index"
import { Icon } from "@galoymoney/react"

import Link from "components/link"

const LoginLink = () => (
  <Link to="/login">
    <Icon name="login" />
    <span className="name">{translate("Login")}</span>
  </Link>
)

export default LoginLink
