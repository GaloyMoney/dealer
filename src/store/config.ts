const isBrowser = typeof window !== "undefined"

if (!isBrowser) {
  const requiredEnvVars = [
    "NODE_ENV",
    "NODE_PATH",
    "SESSION_KEYS",
    "HOST",
    "PORT",
    "SUPPORT_EMAIL",
    "GRAPHQL_URI",
    "GRAPHQL_SUBSCRIPTION_URI",
    "AUTH_ENDPOINT",
  ]

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Missing env var: ${envVar}`)
    }
  })
}

const networkMap = (graphqlUri: string): "mainnet" | "testnet" | "regtest" => {
  if (graphqlUri.match("mainnet")) {
    return "mainnet"
  }

  if (graphqlUri.match("testnet")) {
    return "testnet"
  }

  return "regtest"
}

const config = isBrowser
  ? {
      isBrowser,
      supportEmail: window.__G_DATA.GwwConfig.supportEmail,
      network: networkMap(window.__G_DATA.GwwConfig.graphqlUri),
      graphqlUri: window.__G_DATA.GwwConfig.graphqlUri,
      graphqlSubscriptionUri: window.__G_DATA.GwwConfig.graphqlSubscriptionUri,
      authEndpoint: window.__G_DATA.GwwConfig.authEndpoint,
      sessionKeys: "",
    }
  : {
      isDev: process.env.NODE_ENV !== "production",
      isBrowser,
      sessionKeys: process.env.SESSION_KEYS as string,
      host: process.env.HOST as string,
      port: Number(process.env.PORT),
      supportEmail: process.env.SUPPORT_EMAIL as string,
      network: networkMap(process.env.GRAPHQL_URI as string),
      graphqlUri: process.env.GRAPHQL_URI as string,
      graphqlSubscriptionUri: process.env.GRAPHQL_SUBSCRIPTION_URI as string,

      authEndpoint: process.env.AUTH_ENDPOINT as string,
    }

export default config
