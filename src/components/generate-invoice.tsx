import { gql, useMutation } from "@apollo/client"
import * as React from "react"

import Invoice from "./invoice"

type OperationError = {
  message: string
}

type LnInvoiceObject = {
  paymentRequest: string
}

const LN_INVOICE_CREATE_ON_BEHALF_OF_RECIPIENT = gql`
  mutation lnInvoiceCreateOnBehalfOfRecipient($walletId: WalletId!, $amount: SatAmount!) {
    mutationData: lnInvoiceCreateOnBehalfOfRecipient(
      input: { recipientWalletId: $walletId, amount: $amount }
    ) {
      errors {
        message
      }
      invoice {
        paymentRequest
      }
    }
  }
`

function GenerateInvoice({
  amountInSats,
  userWalletId,
}: {
  amountInSats: number
  userWalletId: string
}) {
  const [createInvoice, { loading, error, data }] = useMutation<{
    mutationData: {
      errors: OperationError[]
      invoice?: LnInvoiceObject
    }
  }>(LN_INVOICE_CREATE_ON_BEHALF_OF_RECIPIENT, { onError: console.error })

  React.useEffect(() => {
    createInvoice({
      variables: { walletId: userWalletId, amount: amountInSats },
    })
  }, [amountInSats, userWalletId, createInvoice])

  if (error) {
    return <div className="error">{error.message}</div>
  }

  if (!data) {
    if (loading) {
      return <div className="loading">Creating Invoice...</div>
    }
    return <div className="loading">...</div>
  }

  const invoiceData = data.mutationData

  if (invoiceData.errors?.length > 0)
    return <div className="error">{invoiceData.errors.join(", ")}</div>

  const { invoice } = invoiceData

  return <>{invoice && <Invoice paymentRequest={invoice.paymentRequest} />}</>
}

export default React.memo(GenerateInvoice)
