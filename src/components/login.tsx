import intlTelInput from "intl-tel-input"
import React, { useCallback, useRef } from "react"

const Login = () => {
  const iti = useRef<intlTelInput.Plugin | null>(null)
  const phoneRef = useCallback(async (node: HTMLInputElement) => {
    if (node !== null) {
      iti.current = intlTelInput(node, {
        autoPlaceholder: "off",
        utilsScript:
          "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.15/js/utils.min.js",
      })
      await iti.current.promise
    }
  }, [])

  const handlePhoneNumberSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    if (!iti.current || !iti.current.isValidNumber()) {
      return
    }

    const number = iti.current.getNumber()
    console.info({ number })
    // Submit number
  }

  return (
    <div className="login">
      <div className="intro">
        Enter your phone number and we'll text you an access code
      </div>
      <form onSubmit={handlePhoneNumberSubmit}>
        <input ref={phoneRef} type="tel" name="phone" />
      </form>
    </div>
  )
}

export default Login
