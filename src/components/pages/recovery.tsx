/* eslint-disable camelcase */
import { useState, useEffect, useCallback } from "react"
import {
  SelfServiceRecoveryFlow,
  SubmitSelfServiceRecoveryFlowBody,
} from "@ory/kratos-client"

import { translate } from "@galoymoney/client"

import { config, history } from "store/index"
import {
  KratosSdk,
  handleFlowError,
  getNodesForFlow,
  KratosFlowData,
  KratosError,
} from "kratos/index"

import { Messages } from "components/kratos"
import Link from "components/link"

type FCT = React.FC<{
  flowData?: KratosFlowData
}>

const Recovery: FCT = ({ flowData: flowDataProp }) => {
  const [flowData, setFlowData] = useState<SelfServiceRecoveryFlow | undefined>(
    flowDataProp?.recoveryData,
  )

  const resetFlow = useCallback(() => {
    setFlowData(undefined)
    window.location.href = "/recovery"
  }, [])

  useEffect(() => {
    if (flowData) {
      return
    }

    const kratos = KratosSdk(config.kratosBrowserUrl)
    const params = new URLSearchParams(window.location.search)
    const flowId = params.get("flow")

    // flow id exists, we can fetch the flow data
    if (flowId) {
      kratos
        .getSelfServiceRecoveryFlow(String(flowId))
        .then(({ data }) => {
          setFlowData(data)
        })
        .catch(handleFlowError({ history, resetFlow }))
      return
    }

    // need to initialize the flow
    kratos
      .initializeSelfServiceRecoveryFlowForBrowsers()
      .then(({ data }) => {
        setFlowData(data)
      })
      .catch(handleFlowError({ history, resetFlow }))
  }, [flowData, resetFlow])

  const handleKratossRecovery = async (values: SubmitSelfServiceRecoveryFlowBody) => {
    const kratos = KratosSdk(config.kratosBrowserUrl)
    kratos
      .submitSelfServiceRecoveryFlow(String(flowData?.id), values, undefined, undefined, {
        withCredentials: true,
      })
      .then(({ data }) => {
        setFlowData(data)
      })
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
      method: "link",
      csrf_token: event.currentTarget.csrf_token.value,
      email: event.currentTarget.email.value,
    }

    handleKratossRecovery(values)
  }

  const nodes = getNodesForFlow(flowData)

  return (
    <div className="recovery-form auth-form">
      <form action={flowData?.ui.action} method="POST" onSubmit={onSubmit}>
        <input
          type="hidden"
          name="csrf_token"
          value={nodes?.csrf_token.attributes.value}
        />
        <div className="input-container">
          <div className="">{translate("Email")}</div>
          <input name="email" type="email" autoComplete="email" required />
          <Messages messages={nodes?.email.messages} />
        </div>
        <Messages messages={flowData?.ui?.messages} />
        <div className="button-container">
          <button className="button" name="method" value="link">
            {translate("Recover Account")}
          </button>
          <Link to="/">{translate("Cancel")}</Link>
        </div>
      </form>
    </div>
  )
}

export default Recovery
