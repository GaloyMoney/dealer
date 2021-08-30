import ReactDOM from "react-dom"
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import "./index.css"
import App from "./App"

const client = new ApolloClient({
  uri: window.env.GRAPHQL_URI,
  cache: new InMemoryCache(),
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root"),
)
