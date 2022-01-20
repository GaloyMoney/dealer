import { gql } from "@apollo/client"

export const MUTATION_CAPTCHA_CREATE_CHALLENGE = gql`
  mutation captchaCreateChallenge {
    captchaCreateChallenge {
      errors {
        message
      }
      result {
        id
        challengeCode
        newCaptcha
        failbackMode
      }
    }
  }
`
export default MUTATION_CAPTCHA_CREATE_CHALLENGE
