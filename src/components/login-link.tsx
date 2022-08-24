import { translate } from "store/index"

import Link from "components/link"
import Icon from "components/icon"

const LoginLink = () => (
  <Link to="/login">
    <Icon name="login" />
    <span className="name">{translate("Login")}</span>
  </Link>
)

export default LoginLink
