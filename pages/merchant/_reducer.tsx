import router from "next/router"
import React from "react"
import { MAX_INPUT_VALUE_LENGTH } from "../../config/config"

export const ACTIONS = {
  ADD_DIGIT: "add-digit",
  DELETE_DIGIT: "delete-digit",
  CLEAR_INPUT: "clear-input",
  CREATE_INVOICE: "create-invoice",
  CREATE_NEW_INVOICE: "create-new-invoice",
  GET_PAYMENT_STATUS: "get-payment-status",
  UPDATE_USERNAME: "update-username",
  UPDATE_WALLET_CURRENCY: "update-wallet-currency",
  SET_AMOUNT_FROM_PARAMS: "set-amount-from-search",
  BACK: "back-by-one-history",
}

export type ACTION_TYPE = {
  type: string
  payload?: string | string[] | (() => void) | undefined
}

function reducer(state: React.ComponentState, { type, payload }: ACTION_TYPE) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if (payload == "0" && state.currentAmount == "0") return { state }
      if (payload === "." && state.currentAmount.includes(".")) return { state }
      if (state.currentAmount == undefined) return { state }
      if (state.currentAmount?.length >= MAX_INPUT_VALUE_LENGTH) return { state }
      if (state.currentAmount.match(/(\.[0-9]{2,}$|\..*\.)/)) return { ...state }
      return {
        ...state,
        currentAmount: `${state.currentAmount || ""}${payload}`,
      }

    case ACTIONS.DELETE_DIGIT:
      if (state.currentAmount == null) return { state }
      return {
        ...state,
        currentAmount: state.currentAmount?.slice(0, -1),
      }

    case ACTIONS.SET_AMOUNT_FROM_PARAMS:
      if (state.currentAmount == null) return { state }
      if (payload?.toString().match(/(\.[0-9]{3,}$|\..*\.)/)) return { state }
      return {
        ...state,
        currentAmount: payload,
      }

    case ACTIONS.UPDATE_USERNAME:
      return {
        ...state,
        username: payload,
      }

    case ACTIONS.UPDATE_WALLET_CURRENCY:
      return {
        ...state,
        walletCurrency: payload,
      }

    case ACTIONS.CLEAR_INPUT:
      if (state.currentAmount == null) return { state }
      if (state.username == null) return { state }
      router.push(
        {
          pathname: `/merchant/${state.username}`,
          query: { amount: 0, currency: state.walletCurrency },
        },
        undefined,
        { shallow: true },
      )
      return {
        ...state,
        currentAmount: "",
      }

    case ACTIONS.CREATE_INVOICE:
      if (state.createdInvoice) return { state }
      if (
        state.currentAmount == null ||
        state.currentAmount === undefined ||
        state.currentAmount === "" ||
        state.currentAmount === "0.00" ||
        state.currentAmount === "0.0"
      )
        return { state }
      router.push(
        {
          pathname: `/merchant/${state.username}`,
          query: { amount: state.currentAmount, currency: state.walletCurrency },
        },
        undefined,
        { shallow: true },
      )
      return {
        ...state,
        createdInvoice: true,
      }

    case ACTIONS.CREATE_NEW_INVOICE:
      if (!state.createdInvoice) return { state }
      router.push(
        {
          pathname: `/merchant/${state.username}`,
          query: { amount: "0", currency: state.walletCurrency },
        },
        undefined,
        { shallow: true },
      )
      return {
        ...state,
        createdInvoice: false,
        currentAmount: "",
      }

    case ACTIONS.GET_PAYMENT_STATUS:
      return {
        ...state,
        paymentStatus: payload,
      }

    case ACTIONS.BACK:
      return {
        ...state,
        createdInvoice: false,
      }

    default:
      return { state }
  }
}

export default reducer
