import { memo, useCallback, useEffect, useState } from "react"

import { Spinner } from "@galoymoney/react"

import { translate } from "store/index"

import AuthCode from "components/login/auth-code"
import { gql } from "@apollo/client"
import {
  useCaptchaCreateChallengeMutation,
  useCaptchaRequestAuthCodeMutation,
} from "graphql/generated"

gql`
  mutation captchaCreateChallenge {
    captchaCreateChallenge {
      errors {
        __typename
        message
      }
      result {
        __typename
        id
        challengeCode
        newCaptcha
        failbackMode
      }
      __typename
    }
  }
`

gql`
  mutation captchaRequestAuthCode($input: CaptchaRequestAuthCodeInput!) {
    captchaRequestAuthCode(input: $input) {
      errors {
        __typename
        message
      }
      success
      __typename
    }
  }
`

const CaptchaChallengeComponent: React.FC<{ phoneNumber: string }> = ({
  phoneNumber,
}) => {
  const [createCaptchaChallenge, { loading: createLoading }] =
    useCaptchaCreateChallengeMutation({
      context: {
        credentials: "omit",
      },
    })
  const [requestCaptchaAuthCode, { loading: requestLoading }] =
    useCaptchaRequestAuthCodeMutation({
      context: {
        credentials: "omit",
      },
    })

  const [captchaState, setCaptchaState] = useState<{
    status: "loading" | "ready" | "success" | "error"
    errorsMessage?: string
  }>({ status: "loading" })

  const captchaHandler = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (captchaObj: any) => {
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

        const status = data?.captchaRequestAuthCode.success ? "success" : "error"
        let errorsMessage = undefined
        if (status === "error") {
          errorsMessage = data?.captchaRequestAuthCode.errors?.[0]?.message
        }

        setCaptchaState({ status, errorsMessage })
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
      const { data } = await createCaptchaChallenge()

      const result = data?.captchaCreateChallenge?.result
      const errorsMessage = data?.captchaCreateChallenge?.errors?.[0]?.message
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
