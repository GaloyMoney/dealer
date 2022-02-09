import config from "../store/config"

const galoySessionName = "galoy-session"

export const clearSession = () => {
  if (config.isBrowser) {
    window.localStorage.removeItem(galoySessionName)
  }
}

export const persistSession = (session: AuthSession) => {
  if (config.isBrowser) {
    if (session) {
      localStorage.setItem(galoySessionName, JSON.stringify(session))
    } else {
      clearSession()
    }
  }
}

export const getPersistedSession = (galoyJwtToken: string | undefined): AuthSession => {
  if (galoyJwtToken) {
    return {
      galoyJwtToken,
    }
  } else if (config.isBrowser) {
    const session = window.localStorage.getItem(galoySessionName)
    if (session) {
      return JSON.parse(session)
    }
  }
  return null
}
