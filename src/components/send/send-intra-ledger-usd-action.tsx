import { useMutation } from "@galoymoney/client"
import { MouseEvent } from "react"

import SendActionDisplay from "components/send/send-action-display"
import { SendActionProps } from "components/send/send-action"

export type SendIntraLedgerUsdActionProps = SendActionProps & {
  recipientWalletId: string
  usdAmount: number
}

type FCT = React.FC<SendIntraLedgerUsdActionProps>

const SendIntraLedgerUsdAction: FCT = (props) => {
  const [sendPayment, { loading, errorsMessage, data }] =
    useMutation.intraLedgerUsdPaymentSend()

  const handleSend = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    sendPayment({
      variables: {
        input: {
          walletId: props.btcWalletId,
          recipientWalletId: props.recipientWalletId,
          amount: 100 * props.usdAmount,
          memo: props.memo,
        },
      },
    })
  }

  return (
    <SendActionDisplay
      loading={loading}
      error={errorsMessage}
      data={data?.intraLedgerUsdPaymentSend}
      feeAmount={{ amount: 0, currency: "CENTS" as const }}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}

export default SendIntraLedgerUsdAction
