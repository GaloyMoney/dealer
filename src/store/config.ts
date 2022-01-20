import "./env-check"

const networkMap = (graphqlUri: string): "mainnet" | "testnet" | "regtest" => {
  if (graphqlUri.match("mainnet")) {
    return "mainnet"
  }

  if (graphqlUri.match("testnet")) {
    return "testnet"
  }

  return "regtest"
}

export default {
  isDev: process.env.NODE_ENV !== "production",
  isBrowser: typeof window !== "undefined",

  sessionKeys: process.env.SESSION_KEYS as string,

  host: process.env.HOST as string,
  port: Number(process.env.PORT),

  supportEmail: process.env.SUPPORT_EMAIL as string,

  network: networkMap(process.env.GRAPHQL_URI as string),
  graphqlUri: process.env.GRAPHQL_URI as string,
  graphqlSubscriptionUri: process.env.GRAPHQL_SUBSCRIPTION_URI as string,

  authEndpoint: process.env.AUTH_ENDPOINT as string,
}
