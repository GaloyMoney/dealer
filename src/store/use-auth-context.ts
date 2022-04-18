import { useContext, createContext } from "react"

export type AuthIdentity = {
  userId: string
  phoneNumber?: string
  emailAddress?: string
  firstName?: string
  lastName?: string
}

export type AuthSession = {
  galoyJwtToken: string
  identity: AuthIdentity
} | null

type AuthContextType = {
  isAuthenticated: boolean
  galoyJwtToken?: string
  authIdentity?: AuthIdentity
  setAuthSession: (session: AuthSession) => void
  syncSession: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setAuthSession: () => {},
  syncSession: () => Promise.resolve(),
})

export const useAuthContext: () => AuthContextType = () => {
  return useContext<AuthContextType>(AuthContext)
}
