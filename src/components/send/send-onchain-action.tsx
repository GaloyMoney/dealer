import { useMutation, useQuery } from "@apollo/client"
import { GaloyGQL, mutations, queries } from "@galoymoney/client"
import { MouseEvent } from "react"

import SendActionDisplay from "./send-action-display"

const SendOnChainAction = (props: SendOnChainActionProps) => {
  const [sendPayment, { loading, error, data }] = useMutation<
    { onChainPaymentSend: GaloyGQL.PaymentSendPayload },
    { input: GaloyGQL.OnChainPaymentSendInput }
  >(mutations.onChainPaymentSend, {
    onError: console.error,
  })

  const {
    loading: feeLoading,
    error: feeError,
    data: feeData,
  } = useQuery<{ onChainTxFee: GaloyGQL.OnChainTxFee }, GaloyGQL.QueryOnChainTxFeeArgs>(
    queries.onChainTxFee,
    {
      variables: {
        walletId: props.btcWalletId,
        address: props.address,
        amount: props.satAmount,
      },
    },
  )

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
      error={error?.message || feeError?.message}
      data={data?.onChainPaymentSend}
      feeSatAmount={feeSatAmount}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}

export default SendOnChainAction
