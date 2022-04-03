import React, { ChangeEvent, useState } from "react"

import { translate } from "@galoymoney/client"
import { Icon, Spinner } from "@galoymoney/react"

import config from "store/config"
import { history, useRequest } from "store/index"
import { useAuthContext } from "store/use-auth-context"

type FCT = React.FC<{ phoneNumber: string }>

const AuthCode: FCT = ({ phoneNumber }) => {
  const request = useRequest()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { setAuthSession } = useAuthContext()

  const submitLoginRequest = async (authCode: string) => {
    setLoading(true)

    const data = await request.post(config.authEndpoint, {
      phoneNumber,
      authCode,
    })

    setLoading(false)

    if (data instanceof Error) {
      setErrorMessage(data.message)
      return
    }

    const session = {
      galoyJwtToken: data?.galoyJwtToken,
      identity: data?.identity,
    }
    setAuthSession(session.galoyJwtToken ? session : null)
    history.push("/")
  }

  const handleAuthCodeSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    setErrorMessage("")
    submitLoginRequest(event.currentTarget.authCode.value)
  }

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("")
    if (event.currentTarget.value.match(/^[0-9]{6}$/u)) {
      submitLoginRequest(event.currentTarget.value)
    }
  }

  return (
    <div className="login">
      <div className="intro">
        {translate(
          "To confirm your phone number, enter the code we just sent you on %{phoneNumber}",
          { phoneNumber },
        )}
      </div>
      <form onSubmit={handleAuthCodeSubmit}>
        <input
          type="number"
          name="authCode"
          className="auth-code"
          autoFocus
          autoComplete="off"
          pattern="[0-9]{6}"
          onChange={handleOnChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? <Spinner size="small" /> : <Icon name="submit" />}
        </button>
      </form>
      {errorMessage && <div className="error">{errorMessage}</div>}
    </div>
  )
}

export default AuthCode
