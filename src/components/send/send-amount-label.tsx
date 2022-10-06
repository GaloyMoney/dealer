import { useCallback, useEffect, useMemo, useState } from "react"

import { formatSats, formatUsd } from "@galoymoney/client"
import {
  FormattedNumberInput,
  DebouncedTextarea,
  OnTextValueChange,
  Spinner,
  OnNumberValueChange,
  SatFormat,
  Icon,
} from "@galoymoney/react"

import { translate } from "store/index"
import useMyUpdates from "hooks/use-my-updates"
import useMainQuery from "hooks/use-main-query"

import { SendScreenInput } from "components/pages/send"
import SendAction from "components/send/send-action"

type FCT = React.FC<{
  input: SendScreenInput
  setInput: React.Dispatch<React.SetStateAction<SendScreenInput>>
}>

const SendAmountLabel: FCT = ({ input, setInput }) => {
  const { satsToUsd, usdToSats } = useMyUpdates()
  const { wallets, btcWallet, btcWalletBalance, usdWalletBalance } = useMainQuery()
  const [showWalletPicker, setShowWalletPicker] = useState(false)

  useEffect(() => {
    if (usdToSats && input.currency === "USD" && typeof input.amount === "number") {
      const newSatAmount = Math.round(usdToSats(input.amount as number))
      setInput((currInput) => ({
        ...currInput,
        satAmount: newSatAmount,
      }))
    }
    if (satsToUsd && input.currency === "SATS" && typeof input.amount === "number") {
      const newUsdAmount = satsToUsd(input.amount as number)
      setInput((currInput) => ({
        ...currInput,
        usdAmount: newUsdAmount,
      }))
    }
  }, [input.currency, input.amount, usdToSats, setInput, satsToUsd])

  useEffect(() => {
    if (input.currency === "SATS" && typeof input.amount === "number") {
      setInput((currInput) => ({
        ...currInput,
        satAmount: input.amount as number,
      }))
    }
    if (input.currency === "USD" && typeof input.amount === "number") {
      setInput((currInput) => ({
        ...currInput,
        usdAmount: input.amount as number,
      }))
    }
  }, [input.currency, input.amount, setInput])

  // FIXME: Redo this when usd-onchain is available
  const fromWallet = input.paymentType === "onchain" ? btcWallet : input.fromWallet

  const handleAmountUpdate: OnNumberValueChange = useCallback(
    (newValue) => {
      setInput((currInput) => ({ ...currInput, amount: newValue }))
    },
    [setInput],
  )

  const handleMemoUpdate: OnTextValueChange = useCallback(
    (newValue) => {
      setInput((currInput) => ({ ...currInput, memo: newValue }))
    },
    [setInput],
  )

  const toggleCurrency = useCallback(() => {
    if (!satsToUsd) {
      // Handle Price Error
      return
    }
    setInput((currInput) => {
      const newCurrency = currInput.currency === "SATS" ? "USD" : "SATS"
      let newAmount: number | "" = ""

      if (currInput.currency === "SATS" && currInput.usdAmount) {
        newAmount = currInput.usdAmount
      }

      if (currInput.currency === "USD" && currInput.satAmount) {
        newAmount = currInput.satAmount
      }

      return {
        ...currInput,
        currency: newCurrency,
        amount: newAmount,
      }
    })
  }, [satsToUsd, setInput])

  const conversionDisplay = useMemo(() => {
    if (!usdToSats || !satsToUsd || !input.amount) {
      return null
    }

    if (input.currency === "SATS") {
      return (
        <div className="amount-display">
          <div className="primary">
            <SatFormat amount={input.satAmount || usdToSats(input.amount)} />
          </div>
          <div className="converted">
            &#8776; {formatUsd(input.usdAmount || satsToUsd(input.amount))}
          </div>
        </div>
      )
    }

    return (
      <div className="amount-display">
        <div className="primary">{formatUsd(input.usdAmount || input.amount)}</div>
        <div className="converted">
          &#8776; <SatFormat amount={input.satAmount || usdToSats(input.amount)} />
        </div>
      </div>
    )
  }, [
    input.amount,
    input.currency,
    input.satAmount,
    input.usdAmount,
    satsToUsd,
    usdToSats,
  ])

  const WalletPickerDisplay = (
    <div className="modal-background">
      <div className="modal-content">
        <div className="title">{translate("From Wallet")}</div>
        <div>
          {wallets.map((wallet) => {
            return (
              <div
                key={wallet.id}
                className="wallet link"
                onClick={() => {
                  setInput((currInput) => ({ ...currInput, fromWallet: wallet }))
                  setShowWalletPicker(false)
                }}
              >
                {wallet.walletCurrency === "BTC" ? (
                  <div className="icon-btc">BTC</div>
                ) : (
                  <div className="icon-usd">USD</div>
                )}
                <div className="title-balance">
                  <div className="title">
                    {wallet.walletCurrency === "BTC"
                      ? "Bitcoin Wallet"
                      : "US Dollar Wallet"}
                  </div>
                  <div className="balance">
                    {wallet.walletCurrency === "BTC" ? (
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
            )
          })}
        </div>
      </div>
    </div>
  )

  const CurrentWalletDisplay = fromWallet && (
    <>
      <div className="input-label">{translate("From Wallet")}</div>
      <div key={fromWallet.id} className="wallet">
        {fromWallet.walletCurrency === "BTC" ? (
          <div className="icon-btc">BTC</div>
        ) : (
          <div className="icon-usd">USD</div>
        )}
        <div className="title-balance">
          <div className="title">
            {fromWallet.walletCurrency === "BTC" ? "Bitcoin Wallet" : "US Dollar Wallet"}
          </div>
          <div className="balance">
            {fromWallet.walletCurrency === "BTC" ? (
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
        {input.paymentType !== "onchain" && wallets.length > 1 && (
          <div className="pick-icon" onClick={() => setShowWalletPicker(true)}>
            <Icon name="submit" />
          </div>
        )}
      </div>
    </>
  )

  return (
    <div>
      <div className="amount-input center-display">
        {wallets && (
          <div className="wallet-selector">
            {showWalletPicker ? WalletPickerDisplay : CurrentWalletDisplay}
          </div>
        )}
        <div className="input-label">{translate("Amount")}</div>
        <div className="amount-input-form">
          <div className="currency-label">
            {input.currency === "SATS" ? <Icon name="sat" /> : "$"}
          </div>
          <FormattedNumberInput
            initValue={input.amount}
            onChange={handleAmountUpdate}
            disabled={input.fixedAmount || showWalletPicker}
            autoComplete="off"
            placeholder={translate("Set value to send in %{currency}", {
              currency: input.currency,
            })}
          />
          {!input.fixedAmount && fromWallet?.walletCurrency === "BTC" && (
            <div className="toggle-currency link" onClick={toggleCurrency}>
              &#8645;
            </div>
          )}
        </div>
      </div>
      <div className="note-input center-display">
        <div className="input-label">{translate("Note or Label")}</div>
        <DebouncedTextarea
          initValue={input.memo}
          onChange={handleMemoUpdate}
          name="memo"
          rows={3}
          disabled={showWalletPicker}
          placeholder={translate("Set a note for the receiver here (optional)")}
        />
      </div>

      {conversionDisplay && <div className="amount-converted">{conversionDisplay}</div>}

      <div className="action-button center-display">
        <SendAction input={input}>
          <button
            onClick={() => setInput((currInput) => ({ ...currInput, view: "confirm" }))}
            disabled={!input.amount || showWalletPicker}
          >
            {translate("Next")} {input.amount === undefined && <Spinner size="small" />}
          </button>
        </SendAction>
      </div>
    </div>
  )
}

export default SendAmountLabel
