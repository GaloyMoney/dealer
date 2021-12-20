import intlTelInput from "intl-tel-input"
import React, { useCallback, useRef, useState } from "react"
import config from "server/config"
import { history, useAppState } from "store"

const PhoneNumber = ({ onSuccess }: { onSuccess: (arg: string) => void }) => {
  const iti = useRef<intlTelInput.Plugin | null>(null)

  const [errorMessage, setErrorMessage] = useState("")

  const phoneRef = useCallback(async (node: HTMLInputElement) => {
    if (node !== null) {
      iti.current = intlTelInput(node, {
        autoPlaceholder: "off",
        utilsScript:
          "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.15/js/utils.min.js",
      })
      await iti.current.promise
      node.focus()
    }
  }, [])

  const handlePhoneNumberSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault()
    setErrorMessage("")
    if (!iti.current || !iti.current.isValidNumber()) {
      setErrorMessage("Invalid phone number")
      return
    }

    const number = iti.current.getNumber()
    onSuccess(number)
  }

  return (
    <div className="login">
      <div className="intro">
        Enter your phone number and we'll text you an access code
      </div>
      <form onSubmit={handlePhoneNumberSubmit}>
        <input
          ref={phoneRef}
          type="tel"
          name="phone"
          autoFocus
          onChange={() => setErrorMessage("")}
        />
      </form>
      {errorMessage && <div className="error">{errorMessage}</div>}
    </div>
  )
}

const AuthCode = ({ phoneNumber }: { phoneNumber: string }) => {
  const { request } = useAppState()
  const [errorMessage, setErrorMessage] = useState("")

  const handleAuthCodeSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    setErrorMessage("")

    const authCode = event.currentTarget.authCode.value

    const data = await request.post(config.authEndpoint, {
      phoneNumber,
      authCode,
    })

    if (data instanceof Error) {
      setErrorMessage(data.message)
      return
    }

    history.push("/", { authToken: data?.authToken })
  }

  return (
    <div className="login">
      <div className="intro">
        To confirm your phone number, enter the code we just sent you on {phoneNumber}
      </div>
      <form onSubmit={handleAuthCodeSubmit}>
        <input
          type="text"
          name="authCode"
          autoFocus
          autoComplete="off"
          pattern="[0-9]{6}"
          onChange={() => setErrorMessage("")}
        />
      </form>
      {errorMessage && <div className="error">{errorMessage}</div>}
    </div>
  )
}

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("")

  const showAuthCodeScreen = (phoneNumberInputValue: string): void => {
    setPhoneNumber(phoneNumberInputValue)
  }

  return phoneNumber ? (
    <AuthCode phoneNumber={phoneNumber} />
  ) : (
    <PhoneNumber onSuccess={showAuthCodeScreen} />
  )
}

export default Login
