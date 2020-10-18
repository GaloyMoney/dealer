import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './components/home.js'
import Receive from './components/receive.js'
import { useRoutes } from 'hookrouter';

const routes = {
  '/': () => <Home />,
  '/uid/:uid': ({ uid }) => <Receive uid={uid} />
};

function App() {

  let routeResult = useRoutes(routes);

  return routeResult || <Home />;
}

export default App;
