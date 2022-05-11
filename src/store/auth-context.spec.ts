import { renderHook } from "@testing-library/react"

import { useAuthContext } from "./auth-context"

describe("useAuthContext", () => {
  it("has defaults", () => {
    const { result } = renderHook(() => useAuthContext())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.setAuthSession).toBeInstanceOf(Function)
    expect(result.current.syncSession).toBeInstanceOf(Function)
  })
})
