import { Configuration } from "@ory/client"
import { V0alpha2ApiInterface, V0alpha2Api } from "@ory/kratos-client"

const kratosApiBaseUrlInternal = process.env.KRATOS_API_BASE_URL as string

export const kratosBrowserUrl = process.env.KRATOS_BROWSER_URL as string

export const kratosFeatureFlag = Boolean(process.env.KRATOS_FEATURE_FLAG || false)

export const kratosSdk: V0alpha2ApiInterface = new V0alpha2Api(
  new Configuration({ basePath: kratosApiBaseUrlInternal }),
) as unknown as V0alpha2ApiInterface
