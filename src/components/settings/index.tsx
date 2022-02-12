import { translate } from "@galoymoney/client"
import { useAuthContext } from "../../store/use-auth-context"

import Header from "../header"
import ColorThemeSetting from "./color-theme"
import LanguageSetting from "./language"
import UsernameSetting from "./username"

const Settings = () => {
  const { isAuthenticated } = useAuthContext()

  return (
    <div className="settings">
      <Header page="settings" />
      <div className="page-title">{translate("Settings")}</div>

      <div className="list">
        <UsernameSetting guestView={!isAuthenticated} />
        <LanguageSetting guestView={!isAuthenticated} />
        <ColorThemeSetting />
      </div>
    </div>
  )
}

export default Settings
