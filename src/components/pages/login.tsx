import { useState } from "react"

import { translate } from "@galoymoney/client"
import { PhoneNumberInput } from "@galoymoney/react"

import { CaptchaChallenge } from "../login/captcha-callenge"

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string | number>("")

  return phoneNumber ? (
    <CaptchaChallenge phoneNumber={phoneNumber} />
  ) : (
    <div className="login">
      <div className="intro">
        {translate("Enter your phone number and we'll text you an access code")}
      </div>
      <PhoneNumberInput onSuccess={setPhoneNumber} onInvalidNumber={setErrorMessage} />
      {errorMessage && <div className="error">{errorMessage}</div>}
    </div>
  )
}

export default Login
