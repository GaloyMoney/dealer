import config from "./config"

const storage = {
  get(name: string) {
    if (config.isBrowser && window.localStorage) {
      return window.localStorage.getItem("galoy:" + name)
    }
    return undefined
  },

  delete(name: string) {
    if (config.isBrowser && window.localStorage) {
      window.localStorage.removeItem("galoy:" + name)
    }
  },

  set(name: string, value: undefined | string | boolean | number) {
    if (config.isBrowser && window.localStorage) {
      if (value === undefined) {
        window.localStorage.removeItem("galoy:" + name)
      } else {
        window.localStorage.setItem("galoy:" + name, value.toString())
      }
    }
  },
}

export default storage
