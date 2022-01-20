import { gql } from "@apollo/client"

export const MUTATION_CAPTCHA_REQUEST_AUTH_CODE = gql`
  mutation captchaRequestAuthCode($input: CaptchaRequestAuthCodeInput!) {
    captchaRequestAuthCode(input: $input) {
      errors {
        message
      }
      success
    }
  }
`
export default MUTATION_CAPTCHA_REQUEST_AUTH_CODE
