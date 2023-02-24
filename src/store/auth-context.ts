import { useContext, createContext } from "react"

export type AuthIdentity = {
  id: string
  uid: string
  phoneNumber?: string
  emailAddress?: string
  firstName?: string
  lastName?: string
  accountStatus?: "NEW" | "PENDING" | "ACTIVE" | "LOCKED" // FIXME: Get from client
}

export type AuthSession = {
  identity: AuthIdentity
} | null

export type KratosCookieResp = {
  kratosUserId: string
  phone: string
}

type AuthContextType = {
  isAuthenticated: boolean
  authIdentity?: AuthIdentity
  setAuthSession: (session: AuthSession) => void
  syncSession: (kratosCookieResp?: KratosCookieResp) => Promise<true | Error>
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setAuthSession: () => {},
  syncSession: () => Promise.resolve(true),
})

export const useAuthContext: () => AuthContextType = () => {
  return useContext<AuthContextType>(AuthContext)
}
