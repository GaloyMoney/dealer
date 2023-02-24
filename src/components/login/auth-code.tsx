import { ChangeEvent, useState } from "react"

import { Spinner } from "@galoymoney/react"

import { config, translate, ajax, history, useAuthContext } from "store/index"

import Icon from "components/icon"

type FCT = React.FC<{ phoneNumber: string }>

const AuthCode: FCT = ({ phoneNumber }) => {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { setAuthSession } = useAuthContext()

  const submitLoginRequest = async (authCode: string) => {
    setLoading(true)

    const session = await ajax.post(config.galoyAuthEndpoint + "/login", {
      phoneNumber,
      authCode,
    })

    setLoading(false)
    setAuthSession(session.identity ? { identity: session.identity } : null)
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
      <form className="auth-code-form" onSubmit={handleAuthCodeSubmit}>
        <input
          type="number"
          name="authCode"
          className="auth-code-input"
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
