import { useContext, createContext } from "react"

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setAuthSession: () => {},
})

export const useAuthContext: UseAuthContextFunction = () => {
  return useContext<AuthContextType>(AuthContext)
}
