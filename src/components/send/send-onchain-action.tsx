import { useMutation, useQuery } from "@galoymoney/client"
import { MouseEvent } from "react"

import SendActionDisplay from "./send-action-display"

const SendOnChainAction = (props: SendOnChainActionProps) => {
  const [sendPayment, { loading, data, errorsMessage: paymentError }] =
    useMutation.onChainPaymentSend()

  const {
    loading: feeLoading,
    data: feeData,
    errorsMessage: feeProbeError,
  } = useQuery.onChainTxFee({
    variables: {
      walletId: props.btcWalletId,
      address: props.address,
      amount: props.satAmount,
    },
  })

  const feeSatAmount = feeData?.onChainTxFee?.amount

  const handleSend = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    sendPayment({
      variables: {
        input: {
          walletId: props.btcWalletId,
          address: props.address,
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
      data={data?.onChainPaymentSend}
      feeSatAmount={feeSatAmount}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}

export default SendOnChainAction
