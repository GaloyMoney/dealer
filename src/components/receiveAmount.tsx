import ReceiveAmountUSDCent from "./receiveAmountUSDCent"
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
        <ReceiveAmountUSDCent
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
