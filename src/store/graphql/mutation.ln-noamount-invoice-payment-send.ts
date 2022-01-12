import { gql } from "@apollo/client"

const MUTATION_LN_NOAMOUNT_INVOICE_PAYMENT_SEND = gql`
  mutation lnNoAmountInvoicePaymentSend($input: LnNoAmountInvoicePaymentInput!) {
    lnNoAmountInvoicePaymentSend(input: $input) {
      errors {
        message
      }
      status
    }
  }
`

export default MUTATION_LN_NOAMOUNT_INVOICE_PAYMENT_SEND
