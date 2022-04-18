import { KratosFlowData } from "kratos/index"
import { AuthRoutePath, RoutePath } from "server/routes"
import { AuthIdentity } from "./use-auth-context"

export type GwwStateType = {
  key: number
  path: RoutePath | AuthRoutePath
  props?: Record<string, unknown>
  authIdentity?: AuthIdentity
  defaultLanguage?: string
  emailVerified?: boolean
  flowData?: KratosFlowData
}

export type GwwActionType = {
  type: "update" | "update-with-key" | "kratos-login"
  authIdentity?: AuthIdentity
  [payloadKey: string]: string | Record<string, string> | undefined
}

export type GwwContextType = {
  state: GwwStateType
  dispatch: React.Dispatch<GwwActionType>
}

const mainReducer = (state: GwwStateType, action: GwwActionType): GwwStateType => {
  const { type, ...newState } = action

  switch (type) {
    case "update":
      return { ...state, ...newState }
    case "update-with-key":
      return { ...state, ...newState, key: Math.random() }
    case "kratos-login":
      return { ...state, authIdentity: newState.authIdentity }
    default:
      throw new Error("UNSUPPORTED_ACTION")
  }
}

export default mainReducer
