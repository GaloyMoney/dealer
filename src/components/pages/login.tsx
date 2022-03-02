import { useCallback, useState } from "react"

import { translate } from "@galoymoney/client"
import { PhoneNumberInput } from "@galoymoney/react"

import config from "store/config"

import Link from "components/link"
import { CaptchaChallenge } from "components/login/captcha-callenge"

const Login: NoPropsFCT = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string | number>("")

  const handleInvalidNumber = useCallback((message: string) => {
    setErrorMessage(translate(message as never))
  }, [])

  return phoneNumber ? (
    <CaptchaChallenge phoneNumber={phoneNumber} />
  ) : (
    <div className="login">
      <div className="intro">
        {translate("Enter your phone number and we'll text you an access code")}
      </div>
      <PhoneNumberInput
        onSuccess={setPhoneNumber}
        onInvalidNumber={handleInvalidNumber}
      />
      {errorMessage && <div className="error">{errorMessage}</div>}
      {config.kratosFeatureFlag && (
        <Link to="/register/email" className="register">
          <i aria-hidden className="fas fa-sign-in-alt" />
          Register via email
        </Link>
      )}
    </div>
  )
}

export default Login
