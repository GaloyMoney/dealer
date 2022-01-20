import { useMutation } from "@apollo/client"
import { GaloyGQL, mutations } from "@galoymoney/client"
import { MouseEvent } from "react"

import SendActionDisplay from "./send-action-display"

const SendIntraLedgerAction = (props: SendActionProps) => {
  const [sendPayment, { loading, error, data }] = useMutation<{
    intraLedgerPaymentSend: GaloyGQL.PaymentSendPayload
  }>(mutations.intraLedgerPaymentSend, {
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
