import ReceiveAmountUSDCENT from "./receiveAmountUSDCENT"
import ReceiveAmountSats from "./receiveAmountSats"

export default function ReceiveAmount({
  userWalletId,
  amount,
  currency,
}: {
  userWalletId: string
  amount: number
  currency: string
}) {
  switch (currency) {
    case "usdcent":
      return (
        <ReceiveAmountUSDCENT
          userWalletId={userWalletId}
          amount={amount}
          currency={currency}
        />
      )
    case "sats":
      return <ReceiveAmountSats userWalletId={userWalletId} amount={amount} />
    default:
      return <>Unsupported</>
  }
}
