import { MouseEvent, useEffect } from "react"

import { useMutation } from "@galoymoney/client"

import SendActionDisplay from "components/send/send-action-display"
import { SendActionProps } from "components/send/send-action"
import useMainQuery from "hooks/use-main-query"

export type SendLnActionProps = SendActionProps & {
  paymentRequest: string
}

type SendLnActionFCT = React.FC<SendLnActionProps>

export const SendLnInvoiceAction: SendLnActionFCT = (props) => {
  const { refetch } = useMainQuery()

  const [sendPayment, { loading, data, errorsMessage: paymentError }] =
    useMutation.lnInvoicePaymentSend({
      onCompleted: () => {
        refetch()
      },
    })

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

  const feeAmount = {
    amount: feeData?.lnInvoiceFeeProbe?.amount ?? undefined,
    currency: "SATS" as const,
  }

  return (
    <SendActionDisplay
      loading={loading || feeLoading}
      error={paymentError || feeProbeError}
      data={data?.lnInvoicePaymentSend}
      feeAmount={feeAmount}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}

export type SendLnNoAmountActionProps = SendLnActionProps & {
  satAmount: number
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

  const feeAmount = {
    amount: props.sameNode ? 0 : feeData?.lnNoAmountInvoiceFeeProbe?.amount ?? undefined,
    currency: "SATS" as const,
  }

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
      feeAmount={feeAmount}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}
