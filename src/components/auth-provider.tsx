import { useMemo, useState, ReactNode, useCallback } from "react"
import { useErrorHandler } from "react-error-boundary"

import { GaloyClient, GaloyProvider } from "@galoymoney/client"

import {
  AuthContext,
  AuthIdentity,
  AuthSession,
  config,
  ajax,
  createClient,
  storage,
  useAppDispatcher,
} from "store/index"

const galoySessionName = "galoy-session"

const clearSession = () => {
  storage.delete(galoySessionName)
}

const persistSession = (session: AuthSession) => {
  if (session) {
    storage.set(galoySessionName, JSON.stringify(session))
  } else {
    clearSession()
  }
}

const getPersistedSession = (sessionData?: { identity?: AuthIdentity }): AuthSession => {
  if (sessionData?.identity) {
    const { identity } = sessionData
    return { identity }
  }
  if (config.isBrowser) {
    const session = storage.get(galoySessionName)

    if (session) {
      // TODO: verify session shape
      return JSON.parse(session)
    }
  }
  return null
}

type FCT = React.FC<{
  children: ReactNode
  galoyClient?: GaloyClient<unknown>
  authIdentity?: AuthIdentity
}>

export const AuthProvider: FCT = ({ children, galoyClient, authIdentity }) => {
  const dispatch = useAppDispatcher()
  const [authSession, setAuthSession] = useState<AuthSession>(() =>
    getPersistedSession({ identity: authIdentity }),
  )

  const setAuth = useCallback((session: AuthSession) => {
    if (session) {
      persistSession(session)
    } else {
      clearSession()
    }

    setAuthSession(session)
  }, [])

  const syncSession = useCallback(async () => {
    const session = await ajax.post(config.authEndpoint)

    if (!session) {
      return new Error("INVALID_AUTH_TOKEN_RESPONSE")
    }

    setAuth(session.identity ? session : null)
    dispatch({ type: "kratos-login", authIdentity: session.identity })
    return true
  }, [dispatch, setAuth])

  const handleError = useErrorHandler()
  const client = useMemo(() => {
    // When server side rendering a client is already provided
    if (galoyClient) {
      return galoyClient
    }
    return createClient({
      onError: ({ graphQLErrors, networkError }) => {
        if (networkError && networkError.message.includes("Failed to fetch")) {
          fetch(config.galoyAuthEndpoint + "/clearCookies", {
            method: "GET",
            redirect: "follow",
            credentials: "include",
          })
          localStorage.clear()
        }
        if (graphQLErrors) {
          console.debug("[GraphQL errors]:", graphQLErrors)
        }
        if (networkError) {
          console.debug("[Network error]:", networkError)
          handleError(networkError)
        }
      },
    })
  }, [galoyClient, handleError])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(authSession?.identity),
        authIdentity: authSession?.identity,
        setAuthSession: setAuth,
        syncSession,
      }}
    >
      <GaloyProvider client={client}>{children}</GaloyProvider>
    </AuthContext.Provider>
  )
}

export default AuthProvider
