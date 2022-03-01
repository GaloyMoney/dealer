import { MouseEvent, useEffect } from "react"

import { useMutation } from "@galoymoney/client"

import SendActionDisplay from "components/send/send-action-display"

type SendLnActionFCT = React.FC<SendLnActionProps>

export const SendLnInvoiceAction: SendLnActionFCT = (props) => {
  const [sendPayment, { loading, data, errorsMessage: paymentError }] =
    useMutation.lnInvoicePaymentSend()

  const [
    propeForFee,
    { loading: feeLoading, data: feeData, errorsMessage: feeProbeError },
  ] = useMutation.lnInvoiceFeeProbe()

  useEffect(() => {
    propeForFee({
      variables: {
        input: { walletId: props.btcWalletId, paymentRequest: props.paymentRequest },
      },
    })
  }, [propeForFee, props.btcWalletId, props.paymentRequest, props.sameNode])

  const handleSend = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    sendPayment({
      variables: {
        input: {
          walletId: props.btcWalletId,
          paymentRequest: props.paymentRequest,
          memo: props.memo,
        },
      },
    })
  }

  const feeSatAmount = feeData?.lnInvoiceFeeProbe?.amount ?? undefined

  return (
    <SendActionDisplay
      loading={loading || feeLoading}
      error={paymentError || feeProbeError}
      data={data?.lnInvoicePaymentSend}
      feeSatAmount={feeSatAmount}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}

type SendLnNoAmountActionFCT = React.FC<SendLnNoAmountActionProps>

export const SendLnNoAmountInvoiceAction: SendLnNoAmountActionFCT = (props) => {
  const [sendPayment, { loading, data, errorsMessage: paymentError }] =
    useMutation.lnNoAmountInvoicePaymentSend()

  const [
    propeForFee,
    { loading: feeLoading, data: feeData, errorsMessage: feeProbeError },
  ] = useMutation.lnNoAmountInvoiceFeeProbe()

  useEffect(() => {
    if (!props.sameNode) {
      propeForFee({
        variables: {
          input: {
            walletId: props.btcWalletId,
            paymentRequest: props.paymentRequest,
            amount: props.satAmount,
          },
        },
      })
    }
  }, [
    propeForFee,
    props.btcWalletId,
    props.paymentRequest,
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
          paymentRequest: props.paymentRequest,
          amount: props.satAmount,
          memo: props.memo,
        },
      },
    })
  }

  return (
    <SendActionDisplay
      loading={loading || feeLoading}
      error={paymentError || feeProbeError}
      data={data?.lnNoAmountInvoicePaymentSend}
      feeSatAmount={feeSatAmount}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}
