import { gql } from "@apollo/client"

export const MUTATION_INTRA_LEDGER_PAYMENT_SEND = gql`
  mutation intraLedgerPaymentSend($input: IntraLedgerPaymentSendInput!) {
    intraLedgerPaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }
`
export default MUTATION_INTRA_LEDGER_PAYMENT_SEND
