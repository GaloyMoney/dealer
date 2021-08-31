export const GRAPHQL_URI = process.env.GRAPHQL_URI as string

export const GRAPHQL_SUBSCRIPTION_URI = process.env.GRAPHQL_SUBSCRIPTION_URI as string

if (!GRAPHQL_URI || !GRAPHQL_SUBSCRIPTION_URI) {
  throw new Error("Missing env variables")
}
