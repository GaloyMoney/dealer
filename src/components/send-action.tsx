import { useMutation } from "@apollo/client"
import { MouseEvent } from "react"

import useMainQuery from "store/use-main-query"
import MUTATION_LN_INVOICE_PAYMENT_SEND from "store/graphql/mutation.ln-invoice-payment-send"
import MUTATION_LN_NOAMOUNT_INVOICE_PAYMENT_SEND from "store/graphql/mutation.ln-noamount-invoice-payment-send"

import Spinner from "./spinner"
import SuccessCheckmark from "./sucess-checkmark"
import MUTATION_INTRA_LEDGER_PAYMENT_SEND from "store/graphql/mutation.intra-ledger-paymest-send"

type SendActionProps = InvoiceInput & {
  reset: () => void
}

const SendFixedAmount = (props: SendActionProps) => {
  const { btcWalletId } = useMainQuery()

  const [payInvoice, { loading, error, data }] = useMutation<{
    lnInvoicePaymentSend: GraphQL.PaymentSendPayload
  }>(MUTATION_LN_INVOICE_PAYMENT_SEND, {
    onError: console.error,
  })

  const errorString =
    error?.message ??
    data?.lnInvoicePaymentSend?.errors?.map((err) => err.message).join(", ")
  const success = data?.lnInvoicePaymentSend?.status === "SUCCESS"

  const handleSend = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    payInvoice({
      variables: {
        input: {
          walletId: btcWalletId,
          paymentRequest: props.paymentRequset,
          memo: props.memo,
        },
      },
    })
  }

  return (
    <>
      {errorString && <div className="error">{errorString}</div>}
      {success ? (
        <div className="invoice-paid">
          <SuccessCheckmark />
          <button onClick={props.reset}>Send another payment</button>
        </div>
      ) : (
        <button onClick={handleSend} disabled={loading}>
          Send {loading && <Spinner size="small" />}
        </button>
      )}
    </>
  )
}

const SendAmount = (props: SendActionProps) => {
  const { btcWalletId } = useMainQuery()

  const [payInvoice, { loading, error, data }] = useMutation<{
    lnNoAmountInvoicePaymentSend: GraphQL.PaymentSendPayload
  }>(MUTATION_LN_NOAMOUNT_INVOICE_PAYMENT_SEND, {
    onError: console.error,
  })

  const errorString =
    error?.message ??
    data?.lnNoAmountInvoicePaymentSend?.errors?.map((err) => err.message).join(", ")
  const success = data?.lnNoAmountInvoicePaymentSend?.status === "SUCCESS"

  const handleSend = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    payInvoice({
      variables: {
        input: {
          walletId: btcWalletId,
          paymentRequest: props.paymentRequset,
          amount: props.satAmount,
          memo: props.memo,
        },
      },
    })
  }

  return (
    <>
      {errorString && <div className="error">{errorString}</div>}
      {success ? (
        <div className="invoice-paid">
          <SuccessCheckmark />
          <button onClick={props.reset}>Send another payment</button>
        </div>
      ) : (
        <button onClick={handleSend} disabled={loading}>
          Send {loading && <Spinner size="small" />}
        </button>
      )}
    </>
  )
}

const SendIntraLedger = (props: SendActionProps) => {
  const { btcWalletId } = useMainQuery()

  const [payInvoice, { loading, error, data }] = useMutation<{
    intraLedgerPaymentSend: GraphQL.PaymentSendPayload
  }>(MUTATION_INTRA_LEDGER_PAYMENT_SEND, {
    onError: console.error,
  })

  const errorString =
    error?.message ??
    data?.intraLedgerPaymentSend?.errors?.map((err) => err.message).join(", ")
  const success = data?.intraLedgerPaymentSend?.status === "SUCCESS"

  const handleSend = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    payInvoice({
      variables: {
        input: {
          walletId: btcWalletId,
          recipientWalletId: props.reciepientWalletId,
          amount: props.satAmount,
          memo: props.memo,
        },
      },
    })
  }

  return (
    <>
      {errorString && <div className="error">{errorString}</div>}
      {success ? (
        <div className="invoice-paid">
          <SuccessCheckmark />
          <button onClick={props.reset}>Send another payment</button>
        </div>
      ) : (
        <button onClick={handleSend} disabled={loading}>
          Send {loading && <Spinner size="small" />}
        </button>
      )}
    </>
  )
}

const SendAction = (props: SendActionProps) => {
  const validInput =
    props.valid &&
    (props.fixedAmount || typeof props.amount === "number") &&
    (props.paymentType !== "intraledger" || props.reciepientWalletId)

  if (!validInput) {
    return <button disabled>Enter amount and destination</button>
  }

  if (props.paymentType === "intraledger") {
    return <SendIntraLedger {...props} />
  }

  if (props.fixedAmount) {
    return <SendFixedAmount {...props} />
  }

  return <SendAmount {...props} />
}

export default SendAction
