import config from "server/config"
import { createBrowserHistory, createMemoryHistory } from "history"

const history = config.isBrowser ? createBrowserHistory() : createMemoryHistory()

export default history
