import { KratosFlowData } from "kratos/index"
import { ValidPath } from "server/routes"
import { AuthIdentity } from "./use-auth-context"

export type GwwStateType = {
  key: number
  path: ValidPath

  props?: Record<string, unknown>
  authIdentity?: AuthIdentity
  defaultLanguage?: string
  emailVerified?: boolean
  flowData?: KratosFlowData
}

export type GwwActionType = {
  type: "update" | "navigate" | "kratos-login"
  path?: ValidPath
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
      return { ...state, ...newState, key: Math.random() }
    case "navigate":
      return { ...state, path: newState.path ?? "/", key: Math.random() }
    case "kratos-login":
      return { ...state, authIdentity: newState.authIdentity }
    default:
      throw new Error("UNSUPPORTED_ACTION")
  }
}

export default mainReducer
