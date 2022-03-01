import { useMutation } from "@galoymoney/client"
import { MouseEvent } from "react"

import SendActionDisplay from "components/send/send-action-display"

type FCT = React.FC<SendIntraLedgerActionProps>

const SendIntraLedgerAction: FCT = (props) => {
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
