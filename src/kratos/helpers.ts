import { kratosBrowserUrl } from "./config"

export const isQuerySet = (query: any): query is string =>
  typeof query === "string" && query.length > 0
const removeTrailingSlash = (str: string) => str.replace(/\/$/u, "")

export const getUrlForFlow = (flow: string, query?: URLSearchParams) =>
  `${removeTrailingSlash(kratosBrowserUrl)}/self-service/${flow}/browser${
    query ? `?${query.toString()}` : ""
  }`
