import { gql } from "@apollo/client"

export const MUTATION_LN_INVOICE_FEE_PROPE = gql`
  mutation lnInvoiceFeeProbe($input: LnInvoiceFeeProbeInput!) {
    lnInvoiceFeeProbe(input: $input) {
      errors {
        message
      }
      amount
    }
  }
`
export default MUTATION_LN_INVOICE_FEE_PROPE
