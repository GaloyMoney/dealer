import { MouseEvent, useEffect } from "react"

import { GaloyGQL, useMutation } from "@galoymoney/client"

import SendActionDisplay from "components/send/send-action-display"
import { SendActionProps } from "components/send/send-action"

export type SendLnUsdActionProps = SendActionProps & {
  fromWallet: GaloyGQL.Wallet
  paymentRequest: string
}

type SendLnUsdActionFCT = React.FC<SendLnUsdActionProps>

export const SendLnUsdInvoiceAction: SendLnUsdActionFCT = (props) => {
  const [sendPayment, { loading, data, errorsMessage: paymentError }] =
    useMutation.lnInvoicePaymentSend()

  const [
    propeForFee,
    { loading: feeLoading, data: feeData, errorsMessage: feeProbeError },
  ] = useMutation.lnUsdInvoiceFeeProbe()

  useEffect(() => {
    propeForFee({
      variables: {
        input: { walletId: props.fromWallet.id, paymentRequest: props.paymentRequest },
      },
    })
  }, [propeForFee, props.fromWallet, props.paymentRequest, props.sameNode])

  const handleSend = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    sendPayment({
      variables: {
        input: {
          walletId: props.fromWallet.id,
          paymentRequest: props.paymentRequest,
          memo: props.memo,
        },
      },
    })
  }

  const feeAmount = {
    amount: feeData?.lnUsdInvoiceFeeProbe?.amount ?? undefined,
    currency: "CENTS" as const,
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

export type SendLnNoAmountUsdActionProps = SendLnUsdActionProps & {
  usdAmount: number
}

type SendLnNoAmountUsdActionFCT = React.FC<SendLnNoAmountUsdActionProps>

export const SendLnNoAmountUsdInvoiceAction: SendLnNoAmountUsdActionFCT = (props) => {
  const [sendPayment, { loading, data, errorsMessage: paymentError }] =
    useMutation.lnNoAmountUsdInvoicePaymentSend()

  const [
    propeForFee,
    { loading: feeLoading, data: feeData, errorsMessage: feeProbeError },
  ] = useMutation.lnNoAmountUsdInvoiceFeeProbe()

  useEffect(() => {
    if (!props.sameNode) {
      propeForFee({
        variables: {
          input: {
            walletId: props.fromWallet.id,
            paymentRequest: props.paymentRequest,
            amount: 100 * props.usdAmount,
          },
        },
      })
    }
  }, [
    propeForFee,
    props.fromWallet.id,
    props.paymentRequest,
    props.sameNode,
    props.usdAmount,
  ])

  const feeAmount = {
    amount: props.sameNode
      ? 0
      : feeData?.lnNoAmountUsdInvoiceFeeProbe?.amount ?? undefined,
    currency: "CENTS" as const,
  }

  const handleSend = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    sendPayment({
      variables: {
        input: {
          walletId: props.fromWallet.id,
          paymentRequest: props.paymentRequest,
          amount: 100 * props.usdAmount,
          memo: props.memo,
        },
      },
    })
  }

  return (
    <SendActionDisplay
      loading={loading || feeLoading}
      error={paymentError || feeProbeError}
      data={data?.lnNoAmountUsdInvoicePaymentSend}
      feeAmount={feeAmount}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}
