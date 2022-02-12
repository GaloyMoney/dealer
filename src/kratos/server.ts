/* eslint-disable camelcase */

import { SelfServiceRegistrationFlow } from "@ory/kratos-client"
import { Request } from "express"
import { getUrlForFlow, isQuerySet, KratosFlow } from "./helpers"
import { KratosSdk } from "./sdk"

export const handleRegister = async (
  req: Request,
  kratosBrowserUrl: string,
): Promise<HandleRegisterResponse> => {
  const { flow, return_to = "" } = req.query

  const initFlowUrl = getUrlForFlow({
    flow: KratosFlow.Registration,
    kratosBrowserUrl,
    query: new URLSearchParams({ return_to: return_to.toString() }),
  })

  // The flow is used to identify the settings and registration flow and
  // return data like the csrf_token and so on.
  if (!isQuerySet(flow)) {
    return { redirect: true, redirectTo: initFlowUrl }
  }

  try {
    const { data }: { data: SelfServiceRegistrationFlow } =
      await KratosSdk().getSelfServiceRegistrationFlow(flow, req.header("Cookie"))
    return { redirect: false, flowData: { registrationData: data } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    switch (error?.response?.status) {
      case 410:
      case 404:
      case 403: {
        return { redirect: true, redirectTo: initFlowUrl }
      }
      default: {
        throw error
      }
    }
  }
}
