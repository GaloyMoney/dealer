import { gql } from "@apollo/client"

const MUTATION_ONCHAIN_PAYMENT_SEND = gql`
  mutation onChainPaymentSend($input: OnChainPaymentSendInput!) {
    onChainPaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }
`

export default MUTATION_ONCHAIN_PAYMENT_SEND
