import { memo, useCallback, useEffect, useState } from "react"

import { translate, useMutation } from "@galoymoney/client"
import { Spinner } from "@galoymoney/react"

import AuthCode from "components/login/auth-code"

type FCT = React.FC<{ phoneNumber: string }>

const CaptchaChallengeComponent: FCT = ({ phoneNumber }) => {
  const [createCaptchaChallenge, { loading: createLoading }] =
    useMutation.captchaCreateChallenge()
  const [requestCaptchaAuthCode, { loading: requestLoading }] =
    useMutation.captchaRequestAuthCode()

  const [captchaState, setCaptchaState] = useState<{
    status: "loading" | "ready" | "success" | "error"
    errorsMessage?: string
  }>({ status: "loading" })

  const captchaHandler = useCallback(
    (captchaObj) => {
      const onSuccess = async () => {
        const result = captchaObj.getValidate()
        const { errorsMessage } = await requestCaptchaAuthCode({
          variables: {
            input: {
              phone: phoneNumber,

              challengeCode: result.geetest_challenge,
              validationCode: result.geetest_validate,
              secCode: result.geetest_seccode,
            },
          },
        })

        setCaptchaState({ status: errorsMessage ? "error" : "success", errorsMessage })
      }
      captchaObj.appendTo("#captcha")
      captchaObj
        .onReady(() => {
          setCaptchaState({ status: "ready" })
          captchaObj.verify()
        })
        .onSuccess(onSuccess)
        .onError((err: unknown) => {
          console.debug("[Captcha error]:", err)
          setCaptchaState({
            status: "error",
            errorsMessage: translate("Invalid verification. Please try again"),
          })
        })
    },
    [phoneNumber, requestCaptchaAuthCode],
  )

  useEffect(() => {
    const initCaptcha = async () => {
      const { data, errorsMessage } = await createCaptchaChallenge()

      const result = data?.captchaCreateChallenge?.result
      if (!errorsMessage && result) {
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
      {hasError && <div className="error">{captchaState.errorsMessage}</div>}
    </div>
  )
}

export const CaptchaChallenge = memo(CaptchaChallengeComponent)
