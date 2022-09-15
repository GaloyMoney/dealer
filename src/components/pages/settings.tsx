/* eslint-disable camelcase */
import { useCallback, useEffect, useState } from "react"
import { SelfServiceSettingsFlow, SubmitSelfServiceSettingsFlowBody } from "@ory/client"

import { translate } from "store/translate"

import { config, history, NoPropsFCT, useAuthContext } from "store/index"
import {
  KratosSdk,
  handleFlowError,
  getNodesForFlow,
  KratosFlowData,
  KratosError,
} from "kratos/index"

import SettingsLayout from "components/settings/layout"
import ColorThemeSetting from "components/settings/color-theme"
import LanguageSetting from "components/settings/language"
import UsernameSetting from "components/settings/username"
import EmailSetting from "components/settings/email"
import { Messages } from "components/kratos"
import LoginLink from "components/login-link"
import LogoutLink from "components/logout-link"
import Link from "components/link"

type FCT = React.FC<{
  flowData?: KratosFlowData
}>

const SettingsPasswordUpdate: FCT = ({ flowData: flowDataProp }) => {
  const { syncSession } = useAuthContext()

  const [flowData, setFlowData] = useState<SelfServiceSettingsFlow | undefined>(
    flowDataProp?.settingsData,
  )

  const resetFlow = useCallback(() => {
    setFlowData(undefined)
    window.location.href = "/login"
  }, [])

  useEffect(() => {
    if (flowData || !config.kratosFeatureFlag) {
      return
    }

    const kratos = KratosSdk(config.kratosBrowserUrl)
    const params = new URLSearchParams(window.location.search)
    const flowId = params.get("flow")
    const returnTo = params.get("return_to")

    if (!flowId) {
      return
    }

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
      .then(({ data }) => setFlowData(data))
      .catch(handleFlowError({ history, resetFlow }))
  }, [flowData, resetFlow, syncSession])

  const handleKratosSettings = async (values: SubmitSelfServiceSettingsFlowBody) => {
    const kratos = KratosSdk(config.kratosBrowserUrl)
    kratos
      .submitSelfServiceSettingsFlow(String(flowData?.id), values, undefined, undefined, {
        withCredentials: true,
      })
      .then(async ({ data }) => setFlowData(data))
      .catch(handleFlowError({ history, resetFlow }))
      .catch((err: KratosError) => {
        // If the previous handler did not catch the error it's most likely a form validation error
        if (err.response?.status === 400) {
          setFlowData(err.response?.data)
          return
        }
        return Promise.reject(err)
      })
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.stopPropagation()
    event.preventDefault()

    const passwordForm = event.currentTarget

    const values = {
      method: "password",
      csrf_token: passwordForm.csrf_token.value,
      password: passwordForm.password.value,
    }

    await handleKratosSettings(values)

    passwordForm.password.value = ""
  }

  const nodes = getNodesForFlow(flowData)

  return (
    <div className="auth-settings auth-form">
      <form action={flowData?.ui.action} method="POST" onSubmit={onSubmit}>
        <Messages messages={flowData?.ui?.messages} />
        <input
          type="hidden"
          name="csrf_token"
          value={nodes?.csrf_token.attributes.value}
        />
        <div className="input-container">
          <div className="">{translate("New Password")}</div>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <Messages messages={nodes?.password.messages} />
        </div>
        <div className="button-container">
          <button className="button" name="method" value="password">
            {translate("Save")}
          </button>
          <Link to="/">{translate("Home")}</Link>
        </div>
      </form>
    </div>
  )
}

const SettingsMainScreen: NoPropsFCT = () => {
  const { isAuthenticated } = useAuthContext()

  return (
    <SettingsLayout>
      <div className="list">
        {config.kratosFeatureFlag && <EmailSetting guestView={!isAuthenticated} />}
        <UsernameSetting guestView={!isAuthenticated} />
        <LanguageSetting guestView={!isAuthenticated} />
        <ColorThemeSetting />
        <div className="setting">{isAuthenticated ? <LogoutLink /> : <LoginLink />}</div>
      </div>
    </SettingsLayout>
  )
}

const getFlow = () => {
  if (!config.isBrowser) {
    return undefined
  }
  const params = new URLSearchParams(window.location.search)

  return params.get("flow")
}

const Settings: FCT = ({ flowData: flowDataProp }) => {
  return getFlow() ? (
    <SettingsPasswordUpdate flowData={flowDataProp} />
  ) : (
    <SettingsMainScreen />
  )
}

export default Settings
