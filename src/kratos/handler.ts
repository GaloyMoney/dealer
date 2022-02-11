/* eslint-disable camelcase */

import { SelfServiceRegistrationFlow } from "@ory/kratos-client"
import { Request } from "express"
import { getUrlForFlow, isQuerySet } from "./helpers"
import { kratosSdk } from "./config"

export const handleRegister = async (req: Request): Promise<HandleRegisterResponse> => {
  const { flow, return_to = "" } = req.query

  const initFlowUrl = getUrlForFlow(
    "registration",
    new URLSearchParams({ return_to: return_to.toString() }),
  )

  // The flow is used to identify the settings and registration flow and
  // return data like the csrf_token and so on.
  if (!isQuerySet(flow)) {
    return { redirect: true, redirectTo: initFlowUrl }
  }

  try {
    const { data }: { data: SelfServiceRegistrationFlow } =
      await kratosSdk.getSelfServiceRegistrationFlow(flow, req.header("Cookie"))
    return { redirect: false, flowData: { registrationData: data } }
  } catch (error: any) {
    switch (error?.response?.status) {
      // Flow ID is old
      case 410:
      case 404: {
        return { redirect: true, redirectTo: initFlowUrl }
      }
      default: {
        console.log("Error while fetching registration flow", {
          error,
          flow,
        })
        throw error
      }
    }
  }
}
