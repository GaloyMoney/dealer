import config from "server/config"
import { createBrowserHistory, createMemoryHistory } from "history"

export const history = config.isBrowser ? createBrowserHistory() : createMemoryHistory()
