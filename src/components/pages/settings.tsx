import { useCallback, useEffect, useState } from "react"
import { translate } from "@galoymoney/client"

import { history } from "../../store/history"
import { useAuthContext } from "store/use-auth-context"
import { KratosSdk, handleFlowError } from "../../kratos"

import Header from "components/header"

import ColorThemeSetting from "components/settings/color-theme"
import LanguageSetting from "components/settings/language"
import UsernameSetting from "components/settings/username"
import config from "store/config"
import EmailSetting from "components/settings/email"

type FCT = React.FC<{
  flowData?: KratosFlowData
}>

const Settings: FCT = ({ flowData: flowDataProp }) => {
  const { syncSession } = useAuthContext()
  const [flowData, setFlowData] = useState<SelfServiceSettingsFlow | undefined>(
    flowDataProp?.settingsData,
  )

  const { isAuthenticated } = useAuthContext()

  const resetFlow = useCallback(() => {
    setFlowData(undefined)
    document.location.href = "/login"
  }, [])

  useEffect(() => {
    if (flowData) {
      return
    }

    const kratos = KratosSdk(config.kratosBrowserUrl)
    const params = new URLSearchParams(window.location.search)
    const flowId = params.get("flow")
    const returnTo = params.get("return_to")

    // flow id exists, we can fetch the flow data
    if (flowId) {
      kratos
        .getSelfServiceSettingsFlow(String(flowId), undefined, undefined, {
          withCredentials: true,
        })
        .then(({ data }) => {
          setFlowData(data)
          syncSession()
        })
        .catch(handleFlowError({ history, resetFlow }))
      return
    }

    // need to initialize the flow
    kratos
      .initializeSelfServiceSettingsFlowForBrowsers(
        returnTo ? String(returnTo) : undefined,
        { withCredentials: true },
      )
      .then(({ data }) => {
        setFlowData(data)
      })
      .catch(handleFlowError({ history, resetFlow }))
  }, [flowData, resetFlow, syncSession])

  return (
    <div className="settings">
      <Header page="settings" />
      <div className="page-title">{translate("Settings")}</div>

      <div className="list">
        <EmailSetting guestView={!isAuthenticated} />
        <UsernameSetting guestView={!isAuthenticated} />
        <LanguageSetting guestView={!isAuthenticated} />
        <ColorThemeSetting />
      </div>
    </div>
  )
}

export default Settings
