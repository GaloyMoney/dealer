import { useCallback, useEffect, useMemo, useState } from "react"

import { formatSats, formatUsd, GaloyGQL } from "@galoymoney/client"
import {
  FormattedNumberInput,
  Icon,
  OnNumberValueChange,
  Spinner,
} from "@galoymoney/react"

import { translate } from "store/index"
import useMainQuery from "hooks/use-main-query"
import useMyUpdates from "hooks/use-my-updates"

import Header from "components/header"
import {
  ConversionData,
  ConvertAmount,
  WalletDescriptor,
} from "components/pages/conversion-flow"

const ConversionInput: React.FC<{
  navigateToNextStep: (data: ConversionData) => void
}> = ({ navigateToNextStep }) => {
  const { wallets, defaultWalletId, usdWalletBalance, btcWalletBalance } = useMainQuery()
  const [fromWallet, setFromWallet] =
    useState<WalletDescriptor<GaloyGQL.WalletCurrency>>()
  const [toWallet, setToWallet] = useState<WalletDescriptor<GaloyGQL.WalletCurrency>>()

  const [convertAmount, setConvertAmount] = useState<
    ConvertAmount<GaloyGQL.WalletCurrency>
  >({ id: 0, amount: 0, currency: "USD" })

  const { satsToUsd, usdToSats } = useMyUpdates()

  const satAmount = useMemo(() => {
    return convertAmount.currency === "BTC"
      ? convertAmount
      : ({
          amount: usdToSats?.(convertAmount.amount) ?? NaN,
          currency: "BTC",
        } as ConvertAmount<"BTC">)
  }, [convertAmount, usdToSats])

  const usdAmount = useMemo(() => {
    return convertAmount.currency === "USD"
      ? convertAmount
      : ({
          amount: satsToUsd?.(convertAmount.amount) ?? NaN,
          currency: "USD",
        } as ConvertAmount<"USD">)
  }, [convertAmount, satsToUsd])

  const [amountFieldError, setAmountFieldError] = useState<string>()

  useEffect(() => {
    const defaultWallet = wallets?.find((wallet) => wallet.id === defaultWalletId)
    const nonDefaultWallet = wallets?.find((wallet) => wallet.id !== defaultWalletId)
    if (nonDefaultWallet) {
      setFromWallet({
        id: nonDefaultWallet.id,
        currency: nonDefaultWallet.walletCurrency,
      })
    }
    if (defaultWallet) {
      setToWallet({ id: defaultWallet.id, currency: defaultWallet.walletCurrency })
    }
  }, [wallets, defaultWalletId, setFromWallet, setToWallet])

  useEffect(() => {
    if (!fromWallet) {
      return
    }

    if (fromWallet.currency === "BTC") {
      if (satAmount.amount > btcWalletBalance) {
        setAmountFieldError(
          translate("Amount exceeds balance of %{balance}", {
            balance: formatSats(btcWalletBalance),
          }),
        )
      } else {
        setAmountFieldError(undefined)
      }
    }

    if (fromWallet.currency === "USD") {
      if (usdAmount.amount > usdWalletBalance) {
        setAmountFieldError(
          translate("Amount exceeds balance of %{balance}", {
            balance: formatUsd(usdWalletBalance),
          }),
        )
      } else {
        setAmountFieldError(undefined)
      }
    }
  }, [satAmount.amount, btcWalletBalance, fromWallet, usdAmount.amount, usdWalletBalance])

  const switchWallets = () => {
    setAmountFieldError(undefined)
    setConvertAmount((currAmount) => ({
      id: currAmount.id + 1,
      amount: 0,
      currency: "USD",
    }))
    setFromWallet(toWallet)
    setToWallet(fromWallet)
  }

  const toggleCurrency = useCallback(() => {
    setConvertAmount((currAmount) => {
      const newCurrency = currAmount.currency === "BTC" ? "USD" : "BTC"
      let newAmount = 0

      if (currAmount.currency === "BTC" && currAmount.amount) {
        newAmount = Math.round(satsToUsd?.(currAmount.amount) ?? NaN)
      }

      if (currAmount.currency === "USD" && currAmount.amount) {
        newAmount = Math.round(usdToSats?.(currAmount.amount * 100) ?? NaN) / 100
      }

      return {
        id: currAmount.id + 1,
        currency: newCurrency,
        amount: newAmount,
      }
    })
  }, [satsToUsd, usdToSats])

  const setAmountFromPercentage = (percentage: number) => {
    if (!fromWallet) {
      return
    }

    if (fromWallet.currency === "BTC") {
      setConvertAmount((currAmount) => ({
        id: currAmount.id + 1,
        currency: "BTC",
        amount: Math.floor((btcWalletBalance * percentage) / 100),
      }))
    }
    if (fromWallet.currency === "USD") {
      setConvertAmount((currAmount) => ({
        id: currAmount.id + 1,
        currency: "USD",
        amount: Math.floor((usdWalletBalance * percentage) / 100),
      }))
    }
  }

  const handleAmountUpdate: OnNumberValueChange = (newValue) => {
    setConvertAmount((currAmount) => ({
      id: currAmount.id,
      currency: currAmount.currency,
      amount: Number(newValue),
    }))
  }

  const isButtonDisabled = () => {
    if (!fromWallet || convertAmount.amount === 0) {
      return true
    }

    if (fromWallet.currency === "BTC" && satAmount.amount <= btcWalletBalance) {
      return false
    }
    if (fromWallet.currency === "USD" && usdAmount.amount <= usdWalletBalance) {
      return false
    }

    return true
  }

  if (!fromWallet || !toWallet) {
    return <Spinner size="big" />
  }

  return (
    <div className="conversion-flow">
      <Header page="conversion-flow" />

      <div className="page-title">{translate("Convert")}</div>

      <div className="container">
        <div className="from-to">
          <div className="wallet from-wallet">
            <div className="label">From</div>
            {fromWallet.currency === "BTC" ? (
              <div className="icon-btc">BTC</div>
            ) : (
              <div className="icon-usd">USD</div>
            )}
            <div className="title-balance">
              <div className="title">
                {fromWallet.currency === "BTC" ? "Bitcoin Wallet" : "US Dollar Wallet"}
              </div>
              <div className="balance">
                {fromWallet.currency === "BTC" ? (
                  <>
                    {formatUsd(satsToUsd?.(btcWalletBalance) ?? NaN)}
                    {" - "}
                    {formatSats(btcWalletBalance)}
                  </>
                ) : (
                  formatUsd(usdWalletBalance)
                )}
              </div>
            </div>
          </div>

          <div className="divider">
            <hr className="left" />
            <div className="icon" onClick={() => switchWallets()}>
              <Icon name="transfer" />
            </div>
            <hr className="right" />
          </div>

          <div className="wallet to-wallet">
            <div className="label">To</div>

            {toWallet.currency === "BTC" ? (
              <div className="icon-btc">BTC</div>
            ) : (
              <div className="icon-usd">USD</div>
            )}

            <div className="title-balance">
              <div className="title">
                {toWallet.currency === "BTC" ? "Bitcoin Wallet" : "US Dollar Wallet"}
              </div>
              <div className="balance">
                {toWallet.currency === "BTC" ? (
                  <>
                    {formatUsd(satsToUsd?.(btcWalletBalance) ?? NaN)}
                    {" - "}
                    {formatSats(btcWalletBalance)}
                  </>
                ) : (
                  formatUsd(usdWalletBalance)
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="amount-input">
          <div className="container">
            <div className="label">Amount</div>
            <div className="content">
              <div className="input">
                <div className="currency-label">
                  {convertAmount.currency === "BTC" ? <Icon name="sat" /> : "$"}
                </div>
                <FormattedNumberInput
                  key={convertAmount.id}
                  initValue={convertAmount.amount}
                  onChange={handleAmountUpdate}
                  disabled={false}
                  autoComplete="off"
                  placeholder={translate("Amount to convert in %{currency}", {
                    currency: convertAmount.currency,
                  })}
                />
                {fromWallet.currency === "BTC" && (
                  <div className="toggle-currency link" onClick={toggleCurrency}>
                    &#8645;
                  </div>
                )}
              </div>
              <div className="converted-input">
                {convertAmount.currency === "BTC"
                  ? formatUsd(usdAmount.amount)
                  : formatSats(satAmount.amount)}
              </div>
            </div>
          </div>
        </div>

        <div className="percentages">
          <div>% to convert</div>
          <div className="buttons">
            <div className="percentage" onClick={() => setAmountFromPercentage(25)}>
              25%
            </div>
            <div className="percentage" onClick={() => setAmountFromPercentage(50)}>
              50%
            </div>
            <div className="percentage" onClick={() => setAmountFromPercentage(75)}>
              75%
            </div>
            <div className="percentage" onClick={() => setAmountFromPercentage(100)}>
              100%
            </div>
          </div>
        </div>

        {amountFieldError && <div className="error">{amountFieldError}</div>}

        <div className="button-next">
          <button
            disabled={isButtonDisabled()}
            onClick={() =>
              navigateToNextStep({ fromWallet, toWallet, satAmount, usdAmount })
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConversionInput
