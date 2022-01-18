import { useMutation } from "@apollo/client"
import { MouseEvent } from "react"

import MUTATION_INTRA_LEDGER_PAYMENT_SEND from "store/graphql/mutation.intra-ledger-paymest-send"

import SendActionDisplay from "./send-action-display"

const SendIntraLedgerAction = (props: SendActionProps) => {
  const [sendPayment, { loading, error, data }] = useMutation<{
    intraLedgerPaymentSend: GraphQL.PaymentSendPayload
  }>(MUTATION_INTRA_LEDGER_PAYMENT_SEND, {
    onError: console.error,
  })

  const handleSend = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    sendPayment({
      variables: {
        input: {
          walletId: props.btcWalletId,
          recipientWalletId: props.reciepientWalletId,
          amount: props.satAmount,
          memo: props.memo,
        },
      },
    })
  }

  return (
    <SendActionDisplay
      loading={loading}
      error={error}
      data={data?.intraLedgerPaymentSend}
      feeSatAmount={0}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}

export default SendIntraLedgerAction
