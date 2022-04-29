import { createBrowserHistory, createMemoryHistory } from "history"

import { config } from "store/config"

export const history = config.isBrowser ? createBrowserHistory() : createMemoryHistory()
