import { translate } from "@galoymoney/client"
import { useAuthContext } from "../../store/use-auth-context"
import Footer from "../footer"

import Header from "../header"
import ColorThemeSetting from "../settings/color-theme"
import LanguageSetting from "../settings/language"
import UsernameSetting from "../settings/username"

const Settings = {} as LayoutComponent<Record<string, never>>

Settings.Large = function Settings() {
  const { isAuthenticated } = useAuthContext()

  return (
    <div className="settings">
      <Header.Large page="settings" />
      <div className="page-title">{translate("Settings")}</div>

      <div className="list">
        <UsernameSetting guestView={!isAuthenticated} />
        <LanguageSetting guestView={!isAuthenticated} />
        <ColorThemeSetting />
      </div>
    </div>
  )
}

Settings.Small = function Settings() {
  const { isAuthenticated } = useAuthContext()

  return (
    <>
      <div className="settings">
        <Header.Small page="settings" />
        <div className="page-title">{translate("Settings")}</div>

        <div className="list">
          <UsernameSetting guestView={!isAuthenticated} />
          <LanguageSetting guestView={!isAuthenticated} />
          <ColorThemeSetting />
        </div>
      </div>
      <Footer page="settings" />
    </>
  )
}

export default Settings
