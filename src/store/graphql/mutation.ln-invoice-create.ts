import { gql } from "@apollo/client"

const MUTATION_LN_INVOICE_CREATE = gql`
  mutation lnInvoiceCreate($input: LnInvoiceCreateInput!) {
    lnInvoiceCreate(input: $input) {
      errors {
        message
      }
      invoice {
        paymentRequest
        paymentHash
      }
    }
  }
`
export default MUTATION_LN_INVOICE_CREATE
