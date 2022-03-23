import { useContext, createContext } from "react"

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setAuthSession: () => {},
  syncSession: () => Promise.resolve(),
})

export const useAuthContext: UseAuthContextFunction = () => {
  return useContext<AuthContextType>(AuthContext)
}
