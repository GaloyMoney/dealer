import React, { ChangeEvent, useCallback, useEffect, useState } from "react"
import { useMutation } from "@apollo/client"

import { GaloyGQL, mutations, translate } from "@galoymoney/client"
import { PhoneNumberInput, Spinner } from "@galoymoney/react"

import config from "store/config"
import { history, useRequest } from "store"
import { errorsText } from "store/graphql"

type AuthCodeProps = { phoneNumber: string }

const AuthCode = ({ phoneNumber }: AuthCodeProps) => {
  const request = useRequest()
  const [errorMessage, setErrorMessage] = useState("")

  const submitLoginRequest = async (authCode: string) => {
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
