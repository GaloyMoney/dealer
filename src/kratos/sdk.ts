import { Configuration, V0alpha2ApiInterface, V0alpha2Api } from "@ory/client"

export const KratosSdk: (kratosEndpoint?: string) => V0alpha2ApiInterface = (
  kratosEndpoint = process.env.KRATOS_API_URL as string,
) =>
  new V0alpha2Api(
    new Configuration({ basePath: kratosEndpoint }),
  ) as unknown as V0alpha2ApiInterface
