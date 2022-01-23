import React, { useCallback, useEffect, useRef, useState } from "react"
import { useMutation } from "@apollo/client"
import intlTelInput from "intl-tel-input"

import config from "store/config"
import { translate } from "translate"
import { history, useRequest } from "store"

import Spinner from "./spinner"
import { GaloyGQL, mutations } from "@galoymoney/client"
import { errorsText } from "store/graphql"

type PhoneNumberProps = { onSuccess: (arg: string) => void }

const PhoneNumber = ({ onSuccess }: PhoneNumberProps) => {
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
      setErrorMessage(translate("Invalid phone number"))
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
        <button type="submit">
          <i aria-hidden className="far fa-arrow-alt-circle-right"></i>
        </button>
      </form>
      {errorMessage && <div className="error">{errorMessage}</div>}
    </div>
  )
}

type AuthCodeProps = { phoneNumber: string }

const AuthCode = ({ phoneNumber }: AuthCodeProps) => {
  const request = useRequest()
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
        {translate(
          "To confirm your phone number, enter the code we just sent you on %{phoneNumber}",
          { phoneNumber },
        )}
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
        <button type="submit">
          <i aria-hidden className="far fa-arrow-alt-circle-right"></i>
        </button>
      </form>
      {errorMessage && <div className="error">{errorMessage}</div>}
    </div>
  )
}

type CaptchaChallenge = { phoneNumber: string }

const CaptchaChallenge = ({ phoneNumber }: AuthCodeProps) => {
  const [captchaState, setCaptchaState] = useState<{
    status: "loading" | "ready" | "success" | "error"
    errorMessage?: string
  }>({ status: "loading" })

  const [createCaptchaChallenge, { loading: createLoading }] = useMutation<{
    captchaCreateChallenge: GaloyGQL.CaptchaCreateChallengePayload
  }>(mutations.captchaCreateChallenge)

  const [requestCaptchaAuthCode, { loading: requestLoading }] = useMutation<
    { captchaRequestAuthCode: GaloyGQL.SuccessPayload },
    { input: GaloyGQL.CaptchaRequestAuthCodeInput }
  >(mutations.captchaRequestAuthCode)

  const captchaHandler = useCallback(
    (captchaObj) => {
      const onSuccess = async () => {
        const result = captchaObj.getValidate()
        const { data } = await requestCaptchaAuthCode({
          variables: {
            input: {
              phone: phoneNumber,

              challengeCode: result.geetest_challenge,
              validationCode: result.geetest_validate,
              secCode: result.geetest_seccode,
            },
          },
        })
        const errorMessage = errorsText(data?.captchaRequestAuthCode)

        setCaptchaState({ status: errorMessage ? "error" : "success", errorMessage })
      }
      captchaObj.appendTo("#captcha")
      captchaObj
        .onReady(() => {
          setCaptchaState({ status: "ready" })
          captchaObj.verify()
        })
        .onSuccess(onSuccess)
        .onError((err: unknown) => {
          console.error(err)
          setCaptchaState({
            status: "error",
            errorMessage: translate("Invaild verification. Please try again"),
          })
        })
    },
    [phoneNumber, requestCaptchaAuthCode],
  )

  useEffect(() => {
    const initCaptcha = async () => {
      const { data, errors } = await createCaptchaChallenge()

      const result = data?.captchaCreateChallenge?.result
      if (!errors && data?.captchaCreateChallenge?.errors?.length === 0 && result) {
        const { id, challengeCode, newCaptcha, failbackMode } = result
        window.initGeetest(
          {
            gt: id,
            challenge: challengeCode,
            offline: failbackMode,
            // eslint-disable-next-line camelcase
            new_captcha: newCaptcha,

            lang: "en",
            product: "bind",
          },
          captchaHandler,
        )
      }
    }
    initCaptcha()
  }, [captchaHandler, createCaptchaChallenge])

  if (captchaState.status === "success") {
    return <AuthCode phoneNumber={phoneNumber} />
  }

  const isLoading = captchaState.status === "loading" || createLoading || requestLoading
  const hasError = !isLoading && captchaState.status === "error"

  return (
    <div className="captcha-challenge">
      <div className="intro">{translate("Verify you are human")}</div>
      <div id="captcha">
        {isLoading && (
          <div className="loading">
            <Spinner size="big" />
          </div>
        )}
      </div>
      {hasError && <div className="error">{captchaState.errorMessage}</div>}
    </div>
  )
}

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("")

  return phoneNumber ? (
    <CaptchaChallenge phoneNumber={phoneNumber} />
  ) : (
    <PhoneNumber onSuccess={setPhoneNumber} />
  )
}

export default Login
