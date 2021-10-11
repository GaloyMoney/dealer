import { useEffect } from "react"
import { gql, useMutation } from "@apollo/client"

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

export default function ReceiveAmountSats({
  userWalletId,
  amount,
}: {
  userWalletId: string
  amount: number
}) {
  const [createInvoice, { loading, error, data }] = useMutation<{
    mutationData: {
      errors: OperationError[]
      invoice?: LnInvoiceObject
    }
  }>(LN_INVOICE_CREATE_ON_BEHALF_OF_RECIPIENT, { onError: console.error })

  useEffect(() => {
    createInvoice({
      variables: { walletId: userWalletId, amount },
    })
  }, [createInvoice, userWalletId, amount])

  if (error) {
    return <div className="error">{error.message}</div>
  }

  let invoice

  if (data) {
    const invoiceData = data.mutationData

    if (invoiceData.errors?.length > 0) {
      return <div className="error">{invoiceData.errors.join(", ")}</div>
    }

    invoice = invoiceData.invoice
  }

  return (
    <>
      {loading && <div className="loading">Loading...</div>}

      {invoice && <Invoice paymentRequest={invoice.paymentRequest} />}
    </>
  )
}
