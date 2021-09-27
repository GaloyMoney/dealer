import { useEffect } from "react"
import Card from "react-bootstrap/Card"
import { gql, useMutation } from "@apollo/client"

import Invoice from "./invoice"

type OperationError = {
  message: string
}

type LnInvoiceObject = {
  paymentRequest: string
}

const LN_INVOICE_CREATE_ON_BEHALF_OF_RECIPIENT = gql`
  mutation lnInvoiceCreateOnBehalfOfRecipient(
    $walletName: WalletName!
    $amount: SatAmount!
  ) {
    mutationData: lnInvoiceCreateOnBehalfOfRecipient(
      input: { recipient: $walletName, amount: $amount }
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

function uiErrorMessage(errorMessage: string) {
  switch (errorMessage) {
    case "CouldNotFindError":
      return "User not found"
    default:
      console.error(errorMessage)
      return "Something went wrong"
  }
}

export default function ReceiveAmount({
  username,
  amount,
}: {
  username: string
  amount: number
}) {
  const [createInvoice, { loading, error, data }] = useMutation<{
    mutationData: {
      errors: OperationError[]
      invoice?: LnInvoiceObject
    }
  }>(LN_INVOICE_CREATE_ON_BEHALF_OF_RECIPIENT)

  useEffect(() => {
    createInvoice({
      variables: { walletName: username, amount: amount },
    })
  }, [createInvoice, username, amount])

  if (error) {
    console.error(error)
  }

  let errorMessage, invoice

  if (data) {
    const invoiceData = data.mutationData

    if (invoiceData.errors?.length > 0) {
      errorMessage = invoiceData.errors[0].message
    }

    invoice = invoiceData.invoice
  }

  return (
    <>
      <Card.Header>
        Pay {username} {amount} Sats
      </Card.Header>

      {errorMessage && <div className="error">{uiErrorMessage(errorMessage)}</div>}

      {loading && !error && (
        <div>
          {" "}
          <br />
          Loading...
        </div>
      )}

      {invoice && <Invoice paymentRequest={invoice.paymentRequest} />}
    </>
  )
}
