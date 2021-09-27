import "bootstrap/dist/css/bootstrap.min.css"
import Home from "./components/home"
import ReceiveNoAmount from "./components/receiveNoAmount"
import ReceiveAmount from "./components/receiveAmount"
import PrintQR from "./components/printQR"
import DownloadApp from "./components/downloadApp"
import { useRoutes } from "hookrouter"
import Header from "./components/header"

const routes = {
  "/": () => <Home />,
  "/download": () => <DownloadApp />,
  "/:username/print": ({ username }: { username: string }) => (
    <PrintQR username={username} />
  ),
  "/:username": ({ username }: { username: string }) => (
    <ReceiveNoAmount username={username} />
  ),
  "/:username/:amount": ({ username, amount }: { username: string; amount: number }) => (
    <ReceiveAmount username={username} amount={amount} />
  ),
}

function App() {
  // @ts-expect-error: TODO
  const routeResult = useRoutes(routes)

  return (
    <div>
      <Header />
      {routeResult || <Home />}
    </div>
  )
}

export default App
