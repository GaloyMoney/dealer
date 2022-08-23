import { useCallback, useState } from "react"

import { translate } from "store/index"
import { PhoneNumberInput } from "@galoymoney/react"

import { CaptchaChallenge } from "components/login/captcha-callenge"

type FCT = React.FC<unknown>

const LoginPhone: FCT = () => {
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
    </div>
  )
}

export default LoginPhone
