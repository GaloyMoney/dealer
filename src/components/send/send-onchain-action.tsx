import { useMutation, useQuery } from "@apollo/client"
import { MouseEvent } from "react"

import MUTATION_ONCHAIN_PAYMENT_SEND from "store/graphql/mutation.onchain-payment-send"
import QUERY_ONCHAIN_TX_FEE from "store/graphql/query.onchain-tx-fee"

import SendActionDisplay from "./send-action-display"

const SendOnChainAction = (props: SendActionProps) => {
  const [sendPayment, { loading, error, data }] = useMutation<
    { onChainPaymentSend: GraphQL.PaymentSendPayload },
    { input: GraphQL.OnChainPaymentSendInput }
  >(MUTATION_ONCHAIN_PAYMENT_SEND, {
    onError: console.error,
  })

  const {
    loading: feeLoading,
    error: feeError,
    data: feeData,
  } = useQuery<{ onChainTxFee: GraphQL.OnChainTxFee }, GraphQL.QueryOnChainTxFeeArgs>(
    QUERY_ONCHAIN_TX_FEE,
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
      error={error || feeError}
      data={data?.onChainPaymentSend}
      feeSatAmount={feeSatAmount}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}

export default SendOnChainAction
