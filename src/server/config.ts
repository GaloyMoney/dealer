const requiredEnvVars = [
  "NODE_ENV",
  "NODE_PATH",
  "SESSION_KEYS",
  "HOST",
  "PORT",
  "GRAPHQL_URI",
  "GRAPHQL_SUBSCRIPTION_URI",
  "AUTH_ENDPOINT",
]

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing env var: ${envVar}`)
  }
})

export default {
  isDev: process.env.NODE_ENV !== "production",
  isBrowser: typeof window !== "undefined",

  sessionKeys: process.env.SESSION_KEYS as string,

  host: process.env.HOST as string,
  port: Number(process.env.PORT),

  graphqlUri: process.env.GRAPHQL_URI as string,
  graphqlSubscriptionUri: process.env.GRAPHQL_SUBSCRIPTION_URI as string,

  authEndpoint: process.env.AUTH_ENDPOINT as string,
}
