import config from "../store/config"
import storage from "./local-storage"

const galoySessionName = "galoy-session"

export const clearSession = () => {
  storage.delete(galoySessionName)
}

export const persistSession = (session: AuthSession) => {
  if (session) {
    storage.set(galoySessionName, JSON.stringify(session))
  } else {
    clearSession()
  }
}

export const getPersistedSession = (galoyJwtToken?: string): AuthSession => {
  if (galoyJwtToken) {
    return { galoyJwtToken }
  }
  if (config.isBrowser) {
    const session = storage.get(galoySessionName)

    if (session) {
      return JSON.parse(session)
    }
  }
  return null
}
