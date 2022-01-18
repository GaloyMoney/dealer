import { useMutation } from "@apollo/client"
import { MouseEvent, useEffect } from "react"

import MUTATION_LN_INVOICE_PAYMENT_SEND from "store/graphql/mutation.ln-invoice-payment-send"
import MUTATION_LN_NOAMOUNT_INVOICE_PAYMENT_SEND from "store/graphql/mutation.ln-noamount-invoice-payment-send"
import MUTATION_LN_INVOICE_FEE_PROPE from "store/graphql/mutation.ln-invoice-fee-prope"
import MUTATION_LN_NO_AMOUNT_INVOICE_FEE_PROPE from "store/graphql/mutation.ln-no-amount-invoice-fee-probe"

import SendActionDisplay from "./send-action-display"

export const SendLnInvoiceAction = (props: SendActionProps) => {
  const [sendPayment, { loading, error, data }] = useMutation<
    { lnInvoicePaymentSend: GraphQL.PaymentSendPayload },
    { input: GraphQL.LnInvoicePaymentInput }
  >(MUTATION_LN_INVOICE_PAYMENT_SEND, {
    onError: console.error,
  })

  const [propeForFee, { loading: feeLoading, error: feeError, data: feeData }] =
    useMutation<
      { lnInvoiceFeeProbe: GraphQL.SatAmountPayload },
      { input: GraphQL.LnInvoiceFeeProbeInput }
    >(MUTATION_LN_INVOICE_FEE_PROPE, {
      onError: console.error,
    })

  useEffect(() => {
    propeForFee({
      variables: {
        input: { walletId: props.btcWalletId, paymentRequest: props.paymentRequset },
      },
    })
  }, [propeForFee, props.btcWalletId, props.paymentRequset, props.sameNode])

  const feeSatAmount = feeData?.lnInvoiceFeeProbe?.amount

  const handleSend = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    sendPayment({
      variables: {
        input: {
          walletId: props.btcWalletId,
          paymentRequest: props.paymentRequset,
          memo: props.memo,
        },
      },
    })
  }

  return (
    <SendActionDisplay
      loading={loading || feeLoading}
      error={error || feeError}
      data={data?.lnInvoicePaymentSend}
      feeSatAmount={feeSatAmount}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}

export const SendLnNoAmountInvoiceAction = (props: SendActionProps) => {
  const [sendPayment, { loading, error, data }] = useMutation<
    { lnNoAmountInvoicePaymentSend: GraphQL.PaymentSendPayload },
    { input: GraphQL.LnNoAmountInvoicePaymentInput }
  >(MUTATION_LN_NOAMOUNT_INVOICE_PAYMENT_SEND, {
    onError: console.error,
  })

  const [propeForFee, { loading: feeLoading, error: feeError, data: feeData }] =
    useMutation<
      { lnNoAmountInvoiceFeeProbe: GraphQL.SatAmountPayload },
      { input: GraphQL.LnNoAmountInvoiceFeeProbeInput }
    >(MUTATION_LN_NO_AMOUNT_INVOICE_FEE_PROPE, {
      onError: console.error,
    })

  useEffect(() => {
    if (!props.sameNode) {
      propeForFee({
        variables: {
          input: {
            walletId: props.btcWalletId,
            paymentRequest: props.paymentRequset,
            amount: props.satAmount,
          },
        },
      })
    }
  }, [
    propeForFee,
    props.btcWalletId,
    props.paymentRequset,
    props.sameNode,
    props.satAmount,
  ])

  const feeSatAmount = props.sameNode ? 0 : feeData?.lnNoAmountInvoiceFeeProbe?.amount

  const handleSend = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    sendPayment({
      variables: {
        input: {
          walletId: props.btcWalletId,
          paymentRequest: props.paymentRequset,
          amount: props.satAmount,
          memo: props.memo,
        },
      },
    })
  }

  return (
    <SendActionDisplay
      loading={loading || feeLoading}
      error={error || feeError}
      data={data?.lnNoAmountInvoicePaymentSend}
      feeSatAmount={feeSatAmount}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}
