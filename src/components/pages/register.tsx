/* eslint-disable camelcase */
import { useState, useEffect, useCallback } from "react"
import { useErrorHandler } from "react-error-boundary"
import {
  SelfServiceRegistrationFlow,
  SubmitSelfServiceRegistrationFlowBody,
} from "@ory/client"

import { config, translate, history, useAuthContext } from "store/index"
import {
  KratosSdk,
  handleFlowError,
  getNodesForFlow,
  KratosFlowData,
  KratosError,
} from "kratos/index"

import Link from "components/link"
import { Messages } from "components/kratos"
import Icon from "components/icon"

type FCT = React.FC<{
  flowData?: KratosFlowData
}>

const Register: FCT = ({ flowData: flowDataProp }) => {
  const handleError = useErrorHandler()
  const { syncSession } = useAuthContext()

  const [flowData, setFlowData] = useState<SelfServiceRegistrationFlow | undefined>(
    flowDataProp?.registrationData,
  )

  const resetFlow = useCallback(() => {
    setFlowData(undefined)
    window.location.href = "/register"
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
        .getSelfServiceRegistrationFlow(String(flowId), undefined, {
          withCredentials: true,
        })
        .then(({ data }) => {
          setFlowData(data)
        })
        .catch(handleFlowError({ history, resetFlow }))
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
      .catch(handleFlowError({ history, resetFlow }))
  }, [flowData, resetFlow])

  const handleKratosRegister = async (values: SubmitSelfServiceRegistrationFlowBody) => {
    const kratos = KratosSdk(config.kratosBrowserUrl)
    kratos
      .submitSelfServiceRegistrationFlow(String(flowData?.id), values, undefined, {
        withCredentials: true,
      })
      .then(async ({ data }) => {
        try {
          if (!data.session) {
            throw new Error("Invalid session")
          }
          const syncStatus = await syncSession()
          if (syncStatus instanceof Error) {
            handleError(syncStatus)
            return
          }
          history.push("/")
        } catch (err) {
          console.error(err)
        }
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
      method: "password",
      csrf_token: event.currentTarget.csrf_token.value,
      traits: {
        email: event.currentTarget["traits.email"].value,
      },
      password: event.currentTarget.password.value,
    }

    handleKratosRegister(values)
  }

  const nodes = getNodesForFlow(flowData)

  return (
    <>
      <div className="register-form auth-form">
        <form action={flowData?.ui.action} method="POST" onSubmit={onSubmit}>
          <input
            type="hidden"
            name="csrf_token"
            value={nodes?.csrf_token.attributes.value}
          />
          <div className="input-container">
            <div className="">{translate("Email")}</div>
            <input
              name="traits.email"
              type="email"
              defaultValue={nodes?.["traits.email"].value}
              autoComplete="email"
              required
            />
            <Messages messages={nodes?.["traits.email"].messages} />
          </div>
          <div className="input-container">
            <div className="">{translate("Password")}</div>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <Messages messages={nodes?.password.messages} />
          </div>
          <Messages messages={flowData?.ui?.messages} />
          <div className="button-container">
            <button className="button" name="method" value="password">
              {translate("Create Account")}
            </button>
            <Link to="/">{translate("Cancel")}</Link>
          </div>
        </form>
      </div>
      <div className="form-links">
        <Link to="/login">
          <Icon name="login" />
          {translate("Login")}
        </Link>
      </div>
    </>
  )
}

export default Register
