import "bootstrap/dist/css/bootstrap.min.css"
import Home from "./components/home"
import Receive from "./components/receive"
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
  "/:username": ({ username }: { username: string }) => <Receive username={username} />,
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
