import { useMutation } from "@apollo/client"
import { MouseEvent, useEffect } from "react"

import SendActionDisplay from "./send-action-display"
import { GaloyGQL, mutations } from "@galoymoney/client"
import { errorsText } from "store/graphql"

export const SendLnInvoiceAction = (props: SendLnActionProps) => {
  const [sendPayment, { loading, error, data }] = useMutation<
    { lnInvoicePaymentSend: GaloyGQL.PaymentSendPayload },
    { input: GaloyGQL.LnInvoicePaymentInput }
  >(mutations.lnInvoicePaymentSend, {
    onError: console.error,
  })

  const [propeForFee, { loading: feeLoading, error: feeError, data: feeData }] =
    useMutation<
      { lnInvoiceFeeProbe: GaloyGQL.SatAmountPayload },
      { input: GaloyGQL.LnInvoiceFeeProbeInput }
    >(mutations.lnInvoiceFeePrope, {
      onError: console.error,
    })

  useEffect(() => {
    propeForFee({
      variables: {
        input: { walletId: props.btcWalletId, paymentRequest: props.paymentRequset },
      },
    })
  }, [propeForFee, props.btcWalletId, props.paymentRequset, props.sameNode])

  const feeSatAmount = feeData?.lnInvoiceFeeProbe?.amount ?? undefined

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

  const paymentError = error?.message || errorsText(data?.lnInvoicePaymentSend)
  const feePropeError = feeError?.message || errorsText(feeData?.lnInvoiceFeeProbe)

  return (
    <SendActionDisplay
      loading={loading || feeLoading}
      error={paymentError || feePropeError}
      data={data?.lnInvoicePaymentSend}
      feeSatAmount={feeSatAmount}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}

export const SendLnNoAmountInvoiceAction = (props: SendLnNoAmountActionProps) => {
  const [sendPayment, { loading, error, data }] = useMutation<
    { lnNoAmountInvoicePaymentSend: GaloyGQL.PaymentSendPayload },
    { input: GaloyGQL.LnNoAmountInvoicePaymentInput }
  >(mutations.lnNoAmountInvoicePaymentSend, {
    onError: console.error,
  })

  const [propeForFee, { loading: feeLoading, error: feeError, data: feeData }] =
    useMutation<
      { lnNoAmountInvoiceFeeProbe: GaloyGQL.SatAmountPayload },
      { input: GaloyGQL.LnNoAmountInvoiceFeeProbeInput }
    >(mutations.lnNoAmountInvoiceFeePrope, {
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

  const feeSatAmount = props.sameNode
    ? 0
    : feeData?.lnNoAmountInvoiceFeeProbe?.amount ?? undefined

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

  const paymentError = error?.message || errorsText(data?.lnNoAmountInvoicePaymentSend)
  const feePropeError =
    feeError?.message || errorsText(feeData?.lnNoAmountInvoiceFeeProbe)

  return (
    <SendActionDisplay
      loading={loading || feeLoading}
      error={paymentError || feePropeError}
      data={data?.lnNoAmountInvoicePaymentSend}
      feeSatAmount={feeSatAmount}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}
