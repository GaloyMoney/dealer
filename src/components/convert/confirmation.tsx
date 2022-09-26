import { useState } from "react"

import { formatCurrencyAmount, useMutation } from "@galoymoney/client"

import { translate } from "store"

import { ConversionData } from "components/pages/conversion-flow"
import useMyUpdates from "hooks/use-my-updates"
import Link from "components/link"

const ConversionConfirmation: React.FC<{
  conversionInput: ConversionData
  navigateToNextStep: (arg: { success: boolean; errorsMessage?: string }) => void
}> = ({ conversionInput, navigateToNextStep }) => {
  const { fromWallet, toWallet, satAmount, usdAmount } = conversionInput

  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const { usdPerBtc } = useMyUpdates()

  const [intraLedgerPaymentSend, { loading: intraLedgerPaymentSendLoading }] =
    useMutation.intraLedgerPaymentSend()
  const [intraLedgerUsdPaymentSend, { loading: intraLedgerUsdPaymentSendLoading }] =
    useMutation.intraLedgerUsdPaymentSend()
  const isLoading = intraLedgerPaymentSendLoading || intraLedgerUsdPaymentSendLoading

  const fromAmount = fromWallet.currency === "BTC" ? satAmount : usdAmount
  const toAmount = toWallet.currency === "BTC" ? satAmount : usdAmount

  const processConversion = async () => {
    if (fromWallet.currency === "BTC") {
      try {
        const { data, errorsMessage } = await intraLedgerPaymentSend({
          variables: {
            input: {
              walletId: fromWallet?.id,
              recipientWalletId: toWallet?.id,
              amount: satAmount.amount,
            },
          },
        })

        const status = data?.intraLedgerPaymentSend.status

        navigateToNextStep({ success: status === "SUCCESS", errorsMessage })
      } catch (err) {
        setErrorMessage(err.message ?? translate("Something went wrong"))
      }
    }
    if (fromWallet.currency === "USD") {
      try {
        const { data, errorsMessage } = await intraLedgerUsdPaymentSend({
          variables: {
            input: {
              walletId: fromWallet?.id,
              recipientWalletId: toWallet?.id,
              amount: usdAmount.amount,
            },
          },
        })

        const status = data?.intraLedgerUsdPaymentSend.status

        navigateToNextStep({ success: status === "SUCCESS", errorsMessage })
      } catch (err) {
        setErrorMessage(err.message ?? translate("Something went wrong"))
      }
    }
  }

  return (
    <div className="conversion-flow">
      <div className="page-title">{translate("Review Conversion")}</div>

      <div className="container">
        <div className="review">
          <div className="row">
            <div className="label">{translate("You're converting")}</div>
            <div className="value">{formatCurrencyAmount(fromAmount)}</div>
          </div>

          <div className="row">
            <div className="label">{translate("To")}</div>
            <div className="value">~ {formatCurrencyAmount(toAmount)}</div>
          </div>

          <div className="row">
            <div className="label">{translate("Receiving Account")}</div>
            <div className="value">
              {toWallet.currency === "BTC"
                ? translate("BTC Account")
                : translate("USD Account")}
            </div>
          </div>

          <div className="row">
            <div className="label">{translate("Rate")}</div>
            <div className="value">
              ~ {formatCurrencyAmount({ currency: "USD", amount: usdPerBtc ?? NaN })} / 1
              BTC
            </div>
          </div>
        </div>

        {errorMessage && <div>{errorMessage}</div>}

        <div className="button-next">
          <button disabled={isLoading} onClick={() => processConversion()}>
            {translate("Convert")}
          </button>

          <Link to="/">{translate("Cancel")}</Link>
        </div>
      </div>
    </div>
  )
}

export default ConversionConfirmation
