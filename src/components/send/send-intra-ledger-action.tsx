import { useMutation } from "@galoymoney/client"
import { MouseEvent } from "react"

import SendActionDisplay from "components/send/send-action-display"
import { SendActionProps } from "components/send/send-action"
import useMainQuery from "hooks/use-main-query"

export type SendIntraLedgerActionProps = SendActionProps & {
  recipientWalletId: string
  satAmount: number
}

type FCT = React.FC<SendIntraLedgerActionProps>

const SendIntraLedgerAction: FCT = (props) => {
  const { refetch } = useMainQuery()

  const [sendPayment, { loading, errorsMessage, data }] =
    useMutation.intraLedgerPaymentSend({
      onCompleted: () => {
        refetch()
      },
    })

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
      feeAmount={{ amount: 0, currency: "SATS" as const }}
      reset={props.reset}
      handleSend={handleSend}
    />
  )
}

export default SendIntraLedgerAction
