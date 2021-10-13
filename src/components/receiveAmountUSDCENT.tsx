import { useEffect } from "react"
import { gql, useMutation } from "@apollo/client"

import Invoice from "./invoice"
import { useOneSatPrice } from "../helpers/use-currency-conversion"

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

export default function ReceiveAmountUSDCent({
  userWalletId,
  amount,
}: {
  userWalletId: string
  amount: number
  currency: string
}) {
  const { oneSatToCents, error: satError } = useOneSatPrice()
  const usdCentValue = amount / oneSatToCents

  const [createInvoice, { loading, error, data }] = useMutation<{
    mutationData: {
      errors: OperationError[]
      invoice?: LnInvoiceObject
    }
  }>(LN_INVOICE_CREATE_ON_BEHALF_OF_RECIPIENT, { onError: console.error })

  useEffect(() => {
    createInvoice({
      variables: { walletId: userWalletId, amount: usdCentValue },
    })
  }, [createInvoice, userWalletId, amount, usdCentValue])

  if (error) <div className="error">{error.message}</div>
  if (satError) <div className="error">{satError.message}</div>

  if (data) {
    const invoiceData = data.mutationData

    if (invoiceData.errors?.length > 0) {
      return <div className="error">{invoiceData.errors.join(", ")}</div>
    }

    const { invoice } = invoiceData

    return (
      <>
        {loading && <div className="loading">Loading...</div>}

        {invoice && <Invoice paymentRequest={invoice.paymentRequest} />}
      </>
    )
  }

  return <div className="loading">Loading...</div>
}
