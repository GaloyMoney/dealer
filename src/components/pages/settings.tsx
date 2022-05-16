/* eslint-disable camelcase */
import { useCallback, useEffect, useState } from "react"
import {
  SelfServiceSettingsFlow,
  SubmitSelfServiceSettingsFlowBody,
} from "@ory/kratos-client"

import { translate } from "@galoymoney/client"

import { config, history, useAuthContext } from "store/index"
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

type FCT = React.FC<{
  flowData?: KratosFlowData
}>

const Settings: FCT = ({ flowData: flowDataProp }) => {
  const { isAuthenticated, syncSession } = useAuthContext()

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
  }, [flowData, isAuthenticated, resetFlow, syncSession])

  const handleKratosRegister = async (values: SubmitSelfServiceSettingsFlowBody) => {
    const kratos = KratosSdk(config.kratosBrowserUrl)
    kratos
      .submitSelfServiceSettingsFlow(String(flowData?.id), undefined, values, {
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

    const values = {
      method: "password",
      csrf_token: event.currentTarget.csrf_token.value,
      password: event.currentTarget.password.value,
    }

    handleKratosRegister(values)
  }

  const nodes = getNodesForFlow(flowData)

  // FIXME: find a better way to identify password change flow
  const changePasswordFlow = flowData?.ui?.messages?.[0]?.id === 1060001

  if (changePasswordFlow) {
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
          </div>
        </form>
      </div>
    )
  }

  return (
    <SettingsLayout>
      {flowData?.ui?.messages && <Messages messages={flowData?.ui?.messages} />}
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

export default Settings
