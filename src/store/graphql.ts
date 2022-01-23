import { GaloyGQL } from "@galoymoney/client"

export const errorsText = (data: undefined | { errors: Array<GaloyGQL.Error> }) => {
  return data?.errors?.map((err) => err.message).join(", ")
}
