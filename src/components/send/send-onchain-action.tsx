import { useMutation, useQuery } from "@galoymoney/client"
import { MouseEvent } from "react"

import SendActionDisplay from "components/send/send-action-display"
import { SendActionProps } from "components/send/send-action"
import useMainQuery from "hooks/use-main-query"

export type SendOnChainActionProps = SendActionProps & {
  address: string
  satAmount: number
}

type FCT = React.FC<SendOnChainActionProps>

const SendOnChainAction: FCT = (props) => {
  const { refetch } = useMainQuery()

  const [sendPayment, { loading, data, errorsMessage: paymentError }] =
    useMutation.onChainPaymentSend({
      onCompleted: () => {
        refetch()
      },
    })

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

  const feeAmount = {
    amount: feeData?.onChainTxFee?.amount ?? undefined,
    currency: "SATS" as const,
  }

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
      feeAmount={feeAmount}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}

export default SendOnChainAction
