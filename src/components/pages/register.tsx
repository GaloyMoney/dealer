import {
  SelfServiceRegistrationFlow,
  SubmitSelfServiceRegistrationFlowBody,
} from "@ory/kratos-client"

import { AxiosError } from "axios"
import { history } from "../../store/history"
import { useState, useEffect } from "react"
import { KratosSdk, handleFlowError } from "../../kratos"
import { Flow } from "../kratos"

import config from "store/config"

type FCT = React.FC<{
  flowData?: KratosFlowData
}>

const Register: FCT = ({ flowData: flowDataProp }) => {
  const [flowData, setFlowData] = useState<SelfServiceRegistrationFlow | undefined>(
    flowDataProp?.registrationData,
  )
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
        .getSelfServiceRegistrationFlow(String(flowId), undefined, {
          withCredentials: true,
        })
        .then(({ data }) => {
          setFlowData(data)
        })
        .catch(
          handleFlowError({
            history,
            resetFlow: () => {
              setFlowData(undefined)
              history.push(`/register/email`)
            },
          }),
        )
      return
    }

    // need to initialize the flow
    kratos
      .initializeSelfServiceRegistrationFlowForBrowsers(
        params.get("return_to") || undefined,
        { withCredentials: true },
      )
      .then(({ data }) => {
        setFlowData(data)
      })
      .catch(
        handleFlowError({
          history,
          resetFlow: () => {
            setFlowData(undefined)
            history.push("/register/email")
          },
        }),
      )
  }, [flowData])

  const onSubmit = async (values: SubmitSelfServiceRegistrationFlowBody) => {
    const kratos = KratosSdk(config.kratosBrowserUrl)
    kratos
      .submitSelfServiceRegistrationFlow(String(flowData?.id), values, {
        withCredentials: true,
      })
      .then(() => {
        return history.push(flowData?.return_to || "/")
      })
      .catch(
        handleFlowError({
          history,
          resetFlow: () => {
            setFlowData(undefined)
            history.push("/register/email")
          },
        }),
      )
      .catch((err: AxiosError) => {
        // If the previous handler did not catch the error it's most likely a form validation error
        if (err.response?.status === 400) {
          setFlowData(err.response?.data)
          history.replace(`/register/email?flow=${flowData?.id}`)
          return
        }

        return Promise.reject(err)
      })
  }

  return (
    <div className="register-form">
      <Flow onSubmit={onSubmit} flow={flowData} />
    </div>
  )
}

export default Register
