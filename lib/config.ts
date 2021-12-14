let GRAPHQL_HOSTNAME = process.env.NEXT_PUBLIC_GRAPHQL_HOSTNAME as string

if (!GRAPHQL_HOSTNAME) {
  if (typeof window !== "undefined") {
    let hostParts = window.location.host.split(".")
    if (hostParts.length <= 3) {
      // throw new Error("Missing env variables")
      hostParts = "pay.mainnet.galoy.io".split(".")
    }
    hostParts[0] = "api"
    GRAPHQL_HOSTNAME = hostParts.join(".")
  } else {
    GRAPHQL_HOSTNAME = "api.mainnet.galoy.io"
  }
}

const GRAPHQL_URI = `https://${GRAPHQL_HOSTNAME}/graphql`
const GRAPHQL_SUBSCRIPTION_URI = `wss://${GRAPHQL_HOSTNAME}/graphql`

export { GRAPHQL_URI, GRAPHQL_SUBSCRIPTION_URI }
