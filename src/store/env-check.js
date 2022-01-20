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
