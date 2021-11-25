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

const INVOICE_STALE_CHECK_INTERVAL = 5 * 60 * 1000
const INVOICE_EXPIRE_INTERVAL = 60 * 60 * 1000

function GenerateInvoice({
  amountInSats,
  userWalletId,
  regenerateAction,
}: {
  amountInSats: number
  userWalletId: string
  regenerateAction: () => void
}) {
  const [invoiceStatus, setInvoiceStatus] = React.useState<
    "loading" | "new" | "need-update" | "expired"
  >("loading")
  const [createInvoice, { loading, error, data }] = useMutation<{
    mutationData: {
      errors: OperationError[]
      invoice?: LnInvoiceObject
    }
  }>(LN_INVOICE_CREATE_ON_BEHALF_OF_RECIPIENT, {
    onError: console.error,
    onCompleted: () => setInvoiceStatus("new"),
  })

  React.useEffect(() => {
    createInvoice({
      variables: { walletId: userWalletId, amount: amountInSats },
    })
    const invoiceNeedUpdateTimer = setTimeout(
      () => setInvoiceStatus("need-update"),
      INVOICE_STALE_CHECK_INTERVAL,
    )
    const invoiceExpiredTimer = setTimeout(
      () => setInvoiceStatus("expired"),
      INVOICE_EXPIRE_INTERVAL,
    )
    return () => {
      clearTimeout(invoiceNeedUpdateTimer)
      clearTimeout(invoiceExpiredTimer)
    }
  }, [amountInSats, userWalletId, createInvoice])

  if (error) {
    return <div className="error">{error.message}</div>
  }

  if (!data) {
    return <div className="loading">{loading && "Creating Invoice"}...</div>
  }

  const invoiceData = data.mutationData

  if (invoiceData.errors?.length > 0) {
    console.error(invoiceData.errors)
    return (
      <div className="error">{invoiceData.errors.map((e) => e.message).join(", ")}</div>
    )
  }

  const { invoice } = invoiceData

  if (invoice) {
    return (
      <>
        {invoiceStatus === "need-update" && (
          <div className="warning">
            Stale Price...{" "}
            <span className="clickable" onClick={regenerateAction}>
              Regenerate Invoice
            </span>
          </div>
        )}
        {invoiceStatus === "expired" ? (
          <div className="warning expired-invoice">
            Invoice Expired...{" "}
            <span className="clickable" onClick={regenerateAction}>
              Generate New Invoice
            </span>
          </div>
        ) : (
          <Invoice paymentRequest={invoice.paymentRequest} />
        )}
      </>
    )
  }

  return null
}

export default React.memo(GenerateInvoice)
