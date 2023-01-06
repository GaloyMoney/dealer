if (typeof window !== "undefined") {
  Object.defineProperty(window, "__G_DATA", {
    value: {
      GwwConfig: {
        graphqlUrl: "https://api.staging.galoy.io/graphql",
        network: "signet",
        kratosFeatureFlag: true,
      },
    },
  })
}
