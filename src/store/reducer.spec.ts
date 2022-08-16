import { renderHook, act } from "@testing-library/react"
import { useReducer } from "react"

import { ValidPath } from "server/routes"

import { mainReducer } from "./reducer"

const defaultState = { key: 0, path: "/" as ValidPath }

describe("mainReducer", () => {
  it("has a generic update action", () => {
    const { result } = renderHook(() => useReducer(mainReducer, defaultState))
    const [_currState, dispatch] = result.current

    act(() => {
      dispatch({
        type: "update",
        emailVerified: true,
      })
    })

    const [newState] = result.current

    expect(newState.emailVerified).toBeTruthy()
  })

  it("has a navigate action", () => {
    const { result } = renderHook(() => useReducer(mainReducer, defaultState))
    const [_currState, dispatch] = result.current

    act(() => {
      dispatch({
        type: "navigate",
        path: "/login",
        emailVerified: true,
      })
    })

    const [newState] = result.current

    expect(newState.path).toBe("/login")
    expect(newState.emailVerified).toBeFalsy() // should only change `path`
  })

  it("has a kratos-login action", () => {
    const { result } = renderHook(() => useReducer(mainReducer, defaultState))
    const [_currState, dispatch] = result.current

    act(() => {
      dispatch({
        type: "kratos-login",
        authIdentity: { id: "1", uid: "A", uidc: "A" },
      })
    })

    const [newState] = result.current

    expect(newState.authIdentity).toEqual({ id: "1", uid: "A", uidc: "A" })
  })
})
