import { renderHook } from "@testing-library/react"

import { useAppDispatcher, useAppState } from "./main-context"

describe("useAppState", () => {
  it("has defaults", () => {
    const { result } = renderHook(() => useAppState())

    expect(result.current.key).toBe(0)
    expect(result.current.path).toBe("/")
  })
})

describe("useAppDispatch", () => {
  it("works", () => {
    const { result } = renderHook(() => useAppDispatcher())

    expect(result.current).toBeInstanceOf(Function)
  })
})
