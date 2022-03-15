// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isQuerySet = (query: any): query is string =>
  typeof query === "string" && query.length > 0

const removeTrailingSlash = (str: string) => str.replace(/\/$/u, "")

export const KratosFlow = {
  Registration: "registration",
  Login: "login",
  Recovery: "recovery",
  Logout: "logout",
} as const

export const getUrlForFlow = ({
  flow,
  kratosBrowserUrl,
  query,
}: {
  flow: typeof KratosFlow[keyof typeof KratosFlow]
  kratosBrowserUrl: string
  query?: URLSearchParams
}) =>
  `${removeTrailingSlash(kratosBrowserUrl)}/self-service/${flow}/browser${
    query ? `?${query.toString()}` : ""
  }`
