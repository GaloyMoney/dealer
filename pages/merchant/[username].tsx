import { useRouter } from "next/router"
import React from "react"
import ButtonGroup from "react-bootstrap/ButtonGroup"
import Container from "react-bootstrap/Container"
import Image from "react-bootstrap/Image"

import styles from "./_user.module.css"
import reducer, { ACTIONS } from "./_reducer"
import ParsePayment from "../../components/ParsePOSPayment"
import { useQuery } from "@galoymoney/client"
import PinToHomescreen from "../../components/PinToHomescreen"

function ReceivePayment() {
  const router = useRouter()
  const { username } = router.query

  const username_from_local = localStorage.getItem("username")
  let accountUsername: string
  if (username == undefined) {
    accountUsername = ""
  } else {
    accountUsername = username.toString()
    if (!username_from_local) {
      localStorage.setItem("username", accountUsername)
    }
  }

  const { data, error: usernameError } = useQuery.accountDefaultWallet({
    variables: { username: accountUsername },
  })

  const [state, dispatch] = React.useReducer(reducer, {
    currentAmount: "",
    createdInvoice: false,
    walletCurrency: data?.accountDefaultWallet.walletCurrency || "USD",
    username: accountUsername,
    pinnedToHomeScreenModalVisible: false,
  })

  React.useEffect(() => {
    if (state.walletCurrency === data?.accountDefaultWallet.walletCurrency) {
      return
    }
    dispatch({
      type: ACTIONS.UPDATE_WALLET_CURRENCY,
      payload: data?.accountDefaultWallet.walletCurrency,
    })
    dispatch({ type: ACTIONS.UPDATE_USERNAME, payload: username })
  }, [state, username, data])

  return (
    <Container className={styles.payment_container}>
      {usernameError ? (
        <div className={styles.error}>
          <p>{`${usernameError.message}.`}</p>
          <p>Please check the username in your browser URL and try again.</p>
        </div>
      ) : (
        <>
          {!state.createdInvoice && (
            <ButtonGroup aria-label="Pin" className={styles.pin_btn_group}>
              <Image
                src="/icons/pin-icon.svg"
                alt="pin icon"
                className={styles.pin_icon}
              />
              <button
                onClick={() => {
                  if (username_from_local) {
                    // clear prev username
                    localStorage.removeItem("username")
                    // cache new user
                    localStorage.setItem("username", accountUsername)
                  }
                  dispatch({
                    type: ACTIONS.PINNED_TO_HOMESCREEN_MODAL_VISIBLE,
                    payload: !state.pinnedToHomeScreenModalVisible,
                  })
                }}
                className={styles.pin_btn}
              >
                Pin to homescreen
              </button>
            </ButtonGroup>
          )}
          <PinToHomescreen
            pinnedToHomeScreenModalVisible={state.pinnedToHomeScreenModalVisible}
            dispatch={dispatch}
          />
          <div className={styles.username_container}>
            {state.createdInvoice && (
              <button onClick={() => dispatch({ type: ACTIONS.BACK })}>
                <Image
                  src="/icons/chevron-left-icon.svg"
                  alt="back button"
                  width="10px"
                  height="12px"
                />
              </button>
            )}
            <p className={styles.username}>{`Pay ${username}`}</p>
          </div>

          <ParsePayment
            state={state}
            dispatch={dispatch}
            defaultWalletCurrency={data?.accountDefaultWallet.walletCurrency}
            walletId={data?.accountDefaultWallet.id}
          />
        </>
      )}
    </Container>
  )
}

export default ReceivePayment
