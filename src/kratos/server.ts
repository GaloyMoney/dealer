/* eslint-disable camelcase */

import {
  SelfServiceLoginFlow,
  SelfServiceRecoveryFlow,
  SelfServiceRegistrationFlow,
  SelfServiceSettingsFlow,
  Session as KratosSession,
} from "@ory/client"
import { Request } from "express"

import { KratosSdk } from "kratos/sdk"
import { getUrlForFlow, isQuerySet, KratosFlow } from "kratos/helpers"
import { AxiosError } from "axios"

export type KratosFlowData = {
  registrationData?: SelfServiceRegistrationFlow
  loginData?: SelfServiceLoginFlow
  recoveryData?: SelfServiceRecoveryFlow
  settingsData?: SelfServiceSettingsFlow
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KratosError = AxiosError<any>

type HandleKratosResponse =
  | { redirect: true; redirectTo: string }
  | { redirect: false; flowData: KratosFlowData }

export const handleRegister = async (
  req: Request,
  kratosBrowserUrl: string,
): Promise<HandleKratosResponse> => {
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
  } catch (error) {
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

export const handleLogin = async (
  req: Request,
  kratosBrowserUrl: string,
): Promise<HandleKratosResponse> => {
  const { flow, return_to = "" } = req.query

  const initFlowUrl = getUrlForFlow({
    flow: KratosFlow.Login,
    kratosBrowserUrl,
    query: new URLSearchParams({ return_to: return_to.toString() }),
  })

  // The flow is used to identify the settings and login flow and
  // return data like the csrf_token and so on.
  if (!isQuerySet(flow)) {
    return { redirect: true, redirectTo: initFlowUrl }
  }

  try {
    const { data }: { data: SelfServiceLoginFlow } =
      await KratosSdk().getSelfServiceLoginFlow(flow, req.header("Cookie"), {
        withCredentials: true,
      })
    return { redirect: false, flowData: { loginData: data } }
  } catch (error) {
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

export const handleRecovery = async (
  req: Request,
  kratosBrowserUrl: string,
): Promise<HandleKratosResponse> => {
  const { flow, return_to = "" } = req.query

  const initFlowUrl = getUrlForFlow({
    flow: KratosFlow.Recovery,
    kratosBrowserUrl,
    query: new URLSearchParams({ return_to: return_to.toString() }),
  })

  // The flow is used to identify the settings and login flow and
  // return data like the csrf_token and so on.
  if (!isQuerySet(flow)) {
    return { redirect: true, redirectTo: initFlowUrl }
  }

  try {
    const { data }: { data: SelfServiceRecoveryFlow } =
      await KratosSdk().getSelfServiceRecoveryFlow(flow, req.header("Cookie"))
    return { redirect: false, flowData: { recoveryData: data } }
  } catch (error) {
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

export const handleWhoAmI = async (req: Request): Promise<KratosSession | undefined> => {
  try {
    const { data } = await KratosSdk().toSession(undefined, req.header("Cookie"))
    return data
  } catch (error) {
    switch (error?.response?.status) {
      case 401: {
        return undefined
      }
      default: {
        throw error
      }
    }
  }
}

export const handleLogout = async (req: Request): Promise<{ redirectTo: string }> => {
  try {
    const { data } = await KratosSdk().createSelfServiceLogoutFlowUrlForBrowsers(
      req.header("Cookie"),
    )

    return { redirectTo: data.logout_url }
  } catch (error) {
    switch (error?.response?.status) {
      case 401: {
        return { redirectTo: "/" }
      }
      default: {
        throw error
      }
    }
  }
}
