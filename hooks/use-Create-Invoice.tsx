import { useState } from "react"

import { useMutation } from "@galoymoney/client"

interface Props {
  recipientWalletCurrency: string | undefined
}

const useCreateInvoice = ({ recipientWalletCurrency }: Props) => {
  const [invoiceStatus, setInvoiceStatus] = useState<
    "loading" | "new" | "need-update" | "expired"
  >("loading")

  const mutation =
    recipientWalletCurrency === "USD"
      ? useMutation.lnUsdInvoiceCreateOnBehalfOfRecipient
      : useMutation.lnInvoiceCreateOnBehalfOfRecipient

  const [createInvoice, { loading, errorsMessage, error, data }] = mutation({
    onError: console.error,
    onCompleted: () => setInvoiceStatus("new"),
  })

  return {
    createInvoice,
    setInvoiceStatus,
    invoiceStatus,
    loading,
    errorsMessage,
    error,
    data,
  }
}

export default useCreateInvoice
