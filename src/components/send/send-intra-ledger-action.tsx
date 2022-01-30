import { useMutation } from "@galoymoney/client"
import { MouseEvent } from "react"

import SendActionDisplay from "./send-action-display"

const SendIntraLedgerAction = (props: SendIntraLedgerActionProps) => {
  const [sendPayment, { loading, errorsMessage, data }] =
    useMutation.intraLedgerPaymentSend()

  const handleSend = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    sendPayment({
      variables: {
        input: {
          walletId: props.btcWalletId,
          recipientWalletId: props.recipientWalletId,
          amount: props.satAmount,
          memo: props.memo,
        },
      },
    })
  }

  return (
    <SendActionDisplay
      loading={loading}
      error={errorsMessage}
      data={data?.intraLedgerPaymentSend}
      feeSatAmount={0}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}

export default SendIntraLedgerAction
