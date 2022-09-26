import { useState } from "react"

import { GaloyGQL } from "@galoymoney/client"

import ConversionInput from "components/convert/input"
import ConversionConfirmation from "components/convert/confirmation"
import ConversionStatus from "components/convert/status"

export type ConvertAmount<T extends GaloyGQL.WalletCurrency> = {
  id: number
  amount: number
  currency: T
}

export type WalletDescriptor<T extends GaloyGQL.WalletCurrency> = {
  id: string
  currency: T
}

export type ConversionData = {
  fromWallet: WalletDescriptor<GaloyGQL.WalletCurrency>
  toWallet: WalletDescriptor<GaloyGQL.WalletCurrency>
  satAmount: ConvertAmount<GaloyGQL.WalletCurrency>
  usdAmount: ConvertAmount<GaloyGQL.WalletCurrency>
}

const ConversionFlow = () => {
  const [step, setStep] = useState<{
    component: "input" | "confirmation" | "status"
    data?: ConversionData
    success?: boolean
    errorsMessage?: string
  }>({
    component: "input",
  })

  switch (step.component) {
    case "input":
      return (
        <ConversionInput
          navigateToNextStep={(data: ConversionData) =>
            setStep({ component: "confirmation", data })
          }
        />
      )
    case "confirmation":
      if (!step.data) {
        throw new Error("Invalid data")
      }
      return (
        <ConversionConfirmation
          conversionInput={step.data}
          navigateToNextStep={({
            success,
            errorsMessage,
          }: {
            success: boolean
            errorsMessage?: string
          }) => setStep({ component: "status", success, errorsMessage })}
        />
      )
    case "status":
      return (
        <ConversionStatus
          success={step?.success ?? false}
          errorsMessage={step?.errorsMessage}
        />
      )
  }
}

export default ConversionFlow
