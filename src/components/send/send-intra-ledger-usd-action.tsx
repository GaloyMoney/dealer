import { useMutation } from "@galoymoney/client"
import { MouseEvent } from "react"

import SendActionDisplay from "components/send/send-action-display"
import { SendActionProps } from "components/send/send-action"
import useMainQuery from "hooks/use-main-query"

export type SendIntraLedgerUsdActionProps = SendActionProps & {
  usdWalletId: string
  recipientWalletId: string
  usdAmount: number
}

type FCT = React.FC<SendIntraLedgerUsdActionProps>

const SendIntraLedgerUsdAction: FCT = (props) => {
  const { refetch } = useMainQuery()

  const [sendPayment, { loading, errorsMessage, data }] =
    useMutation.intraLedgerUsdPaymentSend({
      onCompleted: () => {
        refetch()
      },
    })

  const handleSend = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    sendPayment({
      variables: {
        input: {
          walletId: props.usdWalletId,
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
