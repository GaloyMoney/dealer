import { Request } from "express"

import { appRoutes, AuthRoutePath, authRoutes, RoutePath, ValidPath } from "server/routes"
import { publicConfig, GwwStateType } from "store/index"
import { KratosFlowData } from "kratos/index"

type ServerRenderResponse = {
  GwwState: GwwStateType
  GwwConfig: Record<string, string | boolean | number>
  pageData: Record<string, unknown>
}

const allowedProps = {
  flow: ["/login", "/register", "/recovery", "/settings", "/verification"],
  to: ["/send"],
  username: ["/transactions"],
}

type AllowedProp = keyof typeof allowedProps
type PropValue = number | boolean | string | undefined

const extractAllowedProps = ({
  path,
  props,
}: {
  path: string
  props: Record<string, PropValue | unknown>
}): Record<AllowedProp, PropValue> => {
  return Object.entries(props).reduce((acc, prop) => {
    const [propKey, propValue] = prop
    if (propKey in allowedProps && allowedProps[propKey as AllowedProp].includes(path)) {
      if (["number", "boolean", "string"].includes(typeof propValue)) {
        acc[propKey as AllowedProp] = propValue as PropValue
      }
    }
    return acc
  }, {} as Record<AllowedProp, PropValue>)
}

export const serverRenderer =
  (req: Request) =>
  async ({
    path,
    flowData,
  }: {
    path: ValidPath
    flowData?: KratosFlowData
  }): Promise<Error | ServerRenderResponse> => {
    try {
      const GwwState: GwwStateType = {
        path,
        props: extractAllowedProps({ path, props: req.query }),
        key: 0,
        authIdentity: req.session?.authSession?.identity,
        defaultLanguage: req.acceptsLanguages()?.[0],
        emailVerified: req.session?.emailVerified,
        flowData,
      }

      if (req.session?.emailVerified) {
        req.session.emailVerified = undefined
      }

      return Promise.resolve({
        GwwState,
        GwwConfig: publicConfig,
        pageData:
          flowData === undefined
            ? appRoutes[path as RoutePath]
            : authRoutes[path as AuthRoutePath],
      })
    } catch (err) {
      return err
    }
  }
