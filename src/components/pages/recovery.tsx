import { useState, useEffect, useCallback } from "react"
import {
  SelfServiceRecoveryFlow,
  SubmitSelfServiceRecoveryFlowBody,
} from "@ory/kratos-client"
import { AxiosError } from "axios"

import { history } from "../../store/history"
import { KratosSdk, handleFlowError } from "../../kratos"
import { Flow } from "../kratos"

import config from "store/config"

type FCT = React.FC<{
  flowData?: KratosFlowData
}>

const Recovery: FCT = ({ flowData: flowDataProp }) => {
  const [flowData, setFlowData] = useState<SelfServiceRecoveryFlow | undefined>(
    flowDataProp?.recoveryData,
  )

  const resetFlow = useCallback(() => {
    setFlowData(undefined)
    document.location.href = "/recovery"
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

  const onSubmit = async (values: SubmitSelfServiceRecoveryFlowBody) => {
    const kratos = KratosSdk(config.kratosBrowserUrl)
    kratos
      .submitSelfServiceRecoveryFlow(String(flowData?.id), undefined, values, {
        withCredentials: true,
      })
      .then(({ data }) => {
        setFlowData(data)
      })
      .catch(handleFlowError({ history, resetFlow }))
      .catch((err: AxiosError) => {
        // If the previous handler did not catch the error it's most likely a form validation error
        if (err.response?.status === 400) {
          setFlowData(err.response?.data)
          document.location.replace(`/recovery?flow=${flowData?.id}`)
          return
        }

        return Promise.reject(err)
      })
  }

  return (
    <div className="recovery-form auth-form">
      <Flow onSubmit={onSubmit} flow={flowData} />
    </div>
  )
}

export default Recovery
