import { useRouter } from "next/router"
import React from "react"
import Container from "react-bootstrap/Container"
import Image from "react-bootstrap/Image"

import useSatPrice from "../../lib/use-sat-price"
import { ACTION_TYPE, ACTIONS } from "../../pages/_reducer"
import { formatOperand } from "../../utils/utils"
import Memo from "../Memo"
import DigitButton from "./Digit-Button"
import styles from "./parse-payment.module.css"
import ReceiveInvoice from "./Receive-Invoice"

function isRunningStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches
}

interface Props {
  defaultWalletCurrency?: string
  walletId?: string
  dispatch: React.Dispatch<ACTION_TYPE>
  state: React.ComponentState
}

interface UpdateAmount {
  shouldUpdate: boolean
  value: string | null
}

export enum AmountUnit {
  Sat = "SAT",
  Cent = "CENT",
}

function ParsePayment({ defaultWalletCurrency, walletId, dispatch, state }: Props) {
  const { usdToSats, satsToUsd } = useSatPrice()
  const router = useRouter()
  const { username, amount, sats, unit, memo } = router.query

  const value = usdToSats(Number(state.currentAmount)).toFixed()

  const calcUsdOrCentAmount =
    satsToUsd(Number(sats)) < 0.01 || isNaN(satsToUsd(Number(sats)))
      ? "(less than 1 cent)"
      : satsToUsd(Number(sats)).toFixed(2)

  const valueInUSD = `$ ${
    unit === AmountUnit.Sat ? calcUsdOrCentAmount : formatOperand(state.currentAmount)
  }`
  const valueInSats = `≈ ${
    unit === AmountUnit.Sat
      ? formatOperand(state.currentAmount)
      : formatOperand(value.toString())
  } sats `

  const prevUnit = React.useRef(AmountUnit.Cent)

  const updateCurrentAmountWithParams = React.useCallback((): UpdateAmount => {
    if (unit === AmountUnit.Sat) {
      if (sats === state.currentAmount) {
        return {
          shouldUpdate: false,
          value: null,
        }
      } else if (sats) {
        return {
          shouldUpdate: true,
          value: sats.toString(),
        }
      }
    } else {
      if (Number(amount) === Number(state.currentAmount)) {
        return { shouldUpdate: false, value: null }
      } else if (amount) {
        return { shouldUpdate: true, value: amount.toString() }
      }
    }
    return { shouldUpdate: false, value: null }
  }, [amount, sats, unit, state.currentAmount])

  const toggleCurrency = () => {
    const newUnit = unit === AmountUnit.Sat ? AmountUnit.Cent : AmountUnit.Sat
    prevUnit.current = (unit as AmountUnit) || AmountUnit.Cent
    router.push(
      {
        pathname: `${username}`,
        query: {
          currency: defaultWalletCurrency,
          unit: newUnit,
          memo,
        },
      },
      undefined,
      { shallow: true },
    )
  }

  // Update Params From Current Amount
  React.useEffect(() => {
    if (!unit) return
    const amount =
      unit === AmountUnit.Sat
        ? satsToUsd(state.currentAmount).toFixed(2)
        : state.currentAmount
    const sats =
      unit === AmountUnit.Sat
        ? state.currentAmount
        : usdToSats(Number(state.currentAmount)).toFixed()

    router.push(
      {
        pathname: `${username}`,
        query: {
          amount,
          sats,
          currency: defaultWalletCurrency,
          unit,
          memo,
        },
      },
      undefined,
      { shallow: true },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentAmount])

  // Toggle Current Amount
  React.useEffect(() => {
    if (!unit || unit === prevUnit.current) return
    if (unit === AmountUnit.Cent) {
      dispatch({
        type: ACTIONS.SET_AMOUNT_FROM_PARAMS,
        payload: satsToUsd(state.currentAmount).toFixed(2).toString(),
      })
    }
    if (unit === AmountUnit.Sat) {
      dispatch({
        type: ACTIONS.SET_AMOUNT_FROM_PARAMS,
        payload: value?.toString(),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit])

  // Update Current Amount From Params
  React.useEffect(() => {
    if (!unit || !sats || !amount) return
    const { shouldUpdate, value } = updateCurrentAmountWithParams()
    if (shouldUpdate && value) {
      dispatch({
        type: ACTIONS.SET_AMOUNT_FROM_PARAMS,
        payload: value?.toString(),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, sats, unit, dispatch])

  return (
    <Container className={styles.digits_container}>
      <div className={styles.output}>
        {!state.createdInvoice && !isRunningStandalone() && (
          <button
            onClick={() => {
              dispatch({
                type: ACTIONS.PINNED_TO_HOMESCREEN_MODAL_VISIBLE,
                payload: !state.pinnedToHomeScreenModalVisible,
              })
            }}
            className={styles.pin_btn}
          >
            <Image src="/icons/pin-icon.svg" alt="pin icon" className={styles.pin_icon} />
          </button>
        )}
        <div
          className={`${
            !unit || unit === AmountUnit.Cent ? styles.zero_order : styles.first_order
          }`}
        >
          {valueInUSD}
        </div>
        <div
          className={`${unit === AmountUnit.Sat ? styles.zero_order : styles.first_order}
          }`}
        >
          {unit === AmountUnit.Cent ? valueInSats : valueInSats.slice(1, -1)}
        </div>
        <button title="toggle currency" onClick={() => toggleCurrency()}>
          <Image
            src="/icons/convert-icon.svg"
            alt="convert to SAT/USD icon"
            width="24"
            height="24"
          />
        </button>
      </div>

      <Memo createdInvoice={state.createdInvoice} />

      {state.createdInvoice ? (
        <ReceiveInvoice
          dispatch={dispatch}
          state={state}
          recipientWalletCurrency={defaultWalletCurrency}
          walletId={walletId}
        />
      ) : (
        <div className={styles.digits_grid}>
          <DigitButton digit={"1"} dispatch={dispatch} />
          <DigitButton digit={"2"} dispatch={dispatch} />
          <DigitButton digit={"3"} dispatch={dispatch} />
          <DigitButton digit={"4"} dispatch={dispatch} />
          <DigitButton digit={"5"} dispatch={dispatch} />
          <DigitButton digit={"6"} dispatch={dispatch} />
          <DigitButton digit={"7"} dispatch={dispatch} />
          <DigitButton digit={"8"} dispatch={dispatch} />
          <DigitButton digit={"9"} dispatch={dispatch} />
          <DigitButton
            digit={"."}
            dispatch={dispatch}
            disabled={unit === AmountUnit.Sat}
          />
          <DigitButton digit={"0"} dispatch={dispatch} />
          <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
            <Image
              src="/icons/backspace-icon.svg"
              alt="delete digit icon"
              width="32"
              height="32"
            />
          </button>
        </div>
      )}

      <div className={styles.pay_btn_container}>
        <button
          className={state.createdInvoice ? styles.pay_new_btn : styles.pay_btn}
          onClick={() => {
            if (state.createdInvoice) {
              dispatch({ type: ACTIONS.CREATE_NEW_INVOICE })
            } else {
              dispatch({ type: ACTIONS.CREATE_INVOICE, payload: amount?.toString() })
            }
          }}
        >
          <Image
            src={
              state.createdInvoice
                ? "/icons/lightning-icon-dark.svg"
                : "/icons/lightning-icon.svg"
            }
            alt="lightning icon"
            width="20"
            height="20"
          />
          {state.createdInvoice ? "Create new invoice" : "Create invoice"}
        </button>
        {!state.createdInvoice && (
          <button
            className={styles.clear_btn}
            onClick={() => dispatch({ type: ACTIONS.CLEAR_INPUT })}
          >
            <Image
              src="/icons/clear-input-icon.svg"
              alt="clear input icon"
              width="20"
              height="20"
            />
            Clear
          </button>
        )}
      </div>
    </Container>
  )
}

export default ParsePayment
