import config from "./config"

const localStorage = {
  get(name: string) {
    if (config.isBrowser && window.localStorage) {
      return window.localStorage.getItem("galoy:" + name)
    }
    return undefined
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

export default localStorage
