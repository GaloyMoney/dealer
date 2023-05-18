import { KratosFlowData } from "kratos/server"

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
  flow: (typeof KratosFlow)[keyof typeof KratosFlow]
  kratosBrowserUrl: string
  query?: URLSearchParams
}) =>
  `${removeTrailingSlash(kratosBrowserUrl)}/self-service/${flow}/browser${
    query ? `?${query.toString()}` : ""
  }`

export const getNodesForFlow = (flowData: KratosFlowData[keyof KratosFlowData]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return flowData?.ui?.nodes.reduce((acc: Record<string, any>, curr: any) => {
    acc[curr.attributes.name] = curr
    return acc
  }, {})
}
