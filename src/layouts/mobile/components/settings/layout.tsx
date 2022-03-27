import { translate } from "@galoymoney/client"

import Footer from "components/footer"

const SettingsLayout: React.FC = ({ children }) => {
  return (
    <>
      <div className="settings">
        <div className="page-title">{translate("Settings")}</div>
        {children}
      </div>
      <Footer page="settings" />
    </>
  )
}

export default SettingsLayout
