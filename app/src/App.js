import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './components/home.js'
import Receive from './components/receive.js'
import { useRoutes } from 'hookrouter';
let graphqlUri
try {
  console.log(window.env)
  graphqlUri = window.env.GRAPHQL_URI
} catch(err) {
  console.log(err)
}

const routes = {
  '/': () => <Home graphqlUri={graphqlUri} />,
  '/uid/:uid': ({ uid }) => <Receive graphqlUri={graphqlUri} />
};

function App() {

  let routeResult = useRoutes(routes);
  // routeResult
  console.log(routeResult)

  return routeResult || <Home graphqlUri={graphqlUri}/>;
}

export default App;
