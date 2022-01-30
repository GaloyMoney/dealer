import { useAppState } from "../store"

const useAuthToken: UseAuthTokenFunction = () => {
  const { authToken } = useAppState()

  return {
    authToken,
    hasToken: Boolean(authToken),
  }
}

export default useAuthToken
