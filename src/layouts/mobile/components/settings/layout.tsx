import { translate } from "@galoymoney/client"

import Footer from "components/footer"
import { ChildrenFCT } from "store/types"

const SettingsLayout: ChildrenFCT = ({ children }) => {
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
