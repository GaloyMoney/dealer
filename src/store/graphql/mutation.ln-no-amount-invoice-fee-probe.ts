import { gql } from "@apollo/client"

export const MUTATION_LN_NO_AMOUNT_INVOICE_FEE_PROPE = gql`
  mutation lnNoAmountInvoiceFeeProbe($input: LnNoAmountInvoiceFeeProbeInput!) {
    lnNoAmountInvoiceFeeProbe(input: $input) {
      errors {
        message
      }
      amount
    }
  }
`
export default MUTATION_LN_NO_AMOUNT_INVOICE_FEE_PROPE
