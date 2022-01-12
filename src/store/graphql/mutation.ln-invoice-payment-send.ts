import { gql } from "@apollo/client"

export const MUTATION_LN_INVOICE_PAYMENT_SEND = gql`
  mutation lnInvoicePaymentSend($input: LnInvoicePaymentInput!) {
    lnInvoicePaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }
`

export default MUTATION_LN_INVOICE_PAYMENT_SEND
