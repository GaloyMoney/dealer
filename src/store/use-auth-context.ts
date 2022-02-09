import { useContext, createContext } from "react"

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
  setAuthSession: () => {},
})

export const useAuthContext: UseAuthContextFunction = () => {
  return useContext<AuthContextType>(AuthContext)
}
