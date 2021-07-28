import React from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import Home from "./components/home"
import Receive from "./components/receive"
import PrintQR from "./components/printQR"
import DownloadApp from "./components/downloadApp"
import { useRoutes } from "hookrouter"

const routes = {
  "/": () => <Home />,
  "/download": () => <DownloadApp />,
  "/:username/print": ({ username }) => <PrintQR username={username} />,
  "/:username": ({ username }) => <Receive username={username} />,
}

function App() {
  let routeResult = useRoutes(routes)

  return routeResult || <Home />
}

export default App
