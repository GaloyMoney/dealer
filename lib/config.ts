let GRAPHQL_HOSTNAME = process.env.NEXT_PUBLIC_GRAPHQL_HOSTNAME as string

// we need an internal dns to properly propagate the ip related headers to api
// if we use the api endpoints, nginx will rewrite the header to prevent spoofing
// for example: "api.galoy-name-galoy.svc.cluster.local"
const GRAPHQL_HOSTNAME_INTERNAL = process.env.GRAPHQL_HOSTNAME_INTERNAL as string

// FIXME: remove once dns has been migrated out of ln.bitcoinbeach.com
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

const GRAPHQL_URI_INTERNAL = `http://${GRAPHQL_HOSTNAME_INTERNAL}/graphql`
const GRAPHQL_URI = `https://${GRAPHQL_HOSTNAME}/graphql`
const GRAPHQL_SUBSCRIPTION_URI = `wss://${GRAPHQL_HOSTNAME}/graphql`

const NOSTR_PUBKEY = process.env.NOSTR_PUBKEY as string

export { GRAPHQL_URI, GRAPHQL_SUBSCRIPTION_URI, GRAPHQL_URI_INTERNAL, NOSTR_PUBKEY }
