import config from "./config"
import { createBrowserHistory, createMemoryHistory } from "history"

export const history = config.isBrowser ? createBrowserHistory() : createMemoryHistory()
