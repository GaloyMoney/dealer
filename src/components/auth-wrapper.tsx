import * as React from "react"
import { useAuthContext } from "store"

const AuthWrapper: React.FC<{ children: React.ReactNode; destination?: string }> = ({
  children,
  destination = "/",
}) => {
  const { isAuthenticated } = useAuthContext()

  if (!isAuthenticated) {
    // TODO: render Login
    window.location.href = "/login?to=" + destination
    return null
  }

  return <>{children}</>
}

export default AuthWrapper
