import React, { useMemo, useState, ReactNode } from "react"
import { useErrorHandler } from "react-error-boundary"

import { GaloyClient, GaloyProvider, postRequest } from "@galoymoney/client"
import { createClient } from "../store"
import { getPersistedSession, persistSession, clearSession } from "../store/auth-session"
import { AuthContext } from "../store/use-auth-context"

interface AuthContextProps {
  children: ReactNode
  galoyClient?: GaloyClient<unknown>
  galoyJwtToken?: string
}

export const AuthProvider = ({
  children,
  galoyClient,
  galoyJwtToken,
}: AuthContextProps) => {
  const [authSession, setAuthSession] = useState<AuthSession>(() =>
    getPersistedSession(galoyJwtToken),
  )

  const setAuth = (session: AuthSession) => {
    if (session) {
      persistSession(session)
    } else {
      clearSession()
    }

    setAuthSession(session)
  }

  const handleError = useErrorHandler()
  const client = useMemo(() => {
    // When server side rendering a client is already provided
    if (galoyClient) {
      return galoyClient
    }
    return createClient({
      authToken: authSession?.galoyJwtToken,
      onError: ({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
          console.debug("[GraphQL errors]:", graphQLErrors)
        }
        if (networkError) {
          console.debug("[Network error]:", networkError)
          if (
            "result" in networkError &&
            networkError.result.errors?.[0]?.code === "INVALID_AUTHENTICATION"
          ) {
            postRequest(authSession?.galoyJwtToken)("/api/logout").then(() => {
              setAuth(null)
            })
          } else {
            handleError(networkError)
          }
        }
      },
    })
  }, [handleError, galoyClient, authSession])

  return (
    <AuthContext.Provider
      value={{
        galoyJwtToken: authSession?.galoyJwtToken,
        isAuthenticated: Boolean(authSession?.galoyJwtToken),
        setAuthSession: setAuth,
      }}
    >
      <GaloyProvider client={client}>{children}</GaloyProvider>
    </AuthContext.Provider>
  )
}

export default AuthProvider
