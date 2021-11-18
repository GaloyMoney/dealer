let GRAPHQL_URI = process.env.GRAPHQL_URI as string
let GRAPHQL_SUBSCRIPTION_URI = process.env.GRAPHQL_SUBSCRIPTION_URI as string

if (!GRAPHQL_URI || !GRAPHQL_SUBSCRIPTION_URI) {
  let hostParts = window.location.host.split(".")
  if (hostParts.length <= 3) {
    // throw new Error("Missing env variables")
    hostParts = "pay.mainnet.galoy.io".split(".")
  }
  hostParts[0] = "api"
  GRAPHQL_URI = `https://${hostParts.join(".")}/graphql`
  GRAPHQL_SUBSCRIPTION_URI = `wss://${hostParts.join(".")}/graphql`
}

export { GRAPHQL_URI, GRAPHQL_SUBSCRIPTION_URI }
