import bolt11 from "bolt11"
import url from "url"
import { networks, address } from "bitcoinjs-lib"

import { getDescription, getDestination } from "./bolt11"

export type Network = "mainnet" | "testnet" | "regtest"
export type PaymentType = "lightning" | "onchain" | "intraledger" | "lnurl"
export interface ValidPaymentReponse {
  valid: boolean
  errorMessage?: string | undefined

  paymentRequest?: string | undefined // for lightning
  address?: string | undefined // for bitcoin
  lnurl?: string | undefined // for lnurl
  handle?: string | undefined // for intraledger

  amount?: number | undefined
  memo?: string | undefined
  paymentType?: PaymentType
  sameNode?: boolean | undefined
}

export const lightningInvoiceHasExpired = (
  payReq: bolt11.PaymentRequestObject,
): boolean => {
  return Boolean(payReq?.timeExpireDate && payReq.timeExpireDate < Date.now() / 1000)
}

// from https://github.com/bitcoin/bips/blob/master/bip-0020.mediawiki#Transfer%20amount/size
const reAmount = /^(([\d.]+)(X(\d+))?|x([\da-f]*)(\.([\da-f]*))?(X([\da-f]+))?)$/iu
const parseAmount = (txt: string): number => {
  const match = txt.match(reAmount)
  if (!match) {
    return NaN
  }
  return Math.round(
    match[5]
      ? (parseInt(match[5], 16) +
          (match[7] ? parseInt(match[7], 16) * Math.pow(16, -match[7].length) : 0)) *
          (match[9] ? Math.pow(16, parseInt(match[9], 16)) : 0x10000)
      : Number(match[2]) * (match[4] ? Math.pow(10, Number(match[4])) : 1e8),
  )
}

type ParsePaymentDestinationArgs = {
  destination: string
  network: Network
  pubKey: string
}

export const parsePaymentDestination = ({
  destination,
  network,
  pubKey,
}: ParsePaymentDestinationArgs): ValidPaymentReponse => {
  if (!destination) {
    return { valid: false }
  }

  // input might start with 'lightning:', 'bitcoin:'
  const [protocol, data] = destination
    .split(":")
    .map((value) => value.toLocaleLowerCase())

  const destinationText = data ?? protocol

  if (destinationText.startsWith("lnurl")) {
    return {
      valid: true,
      paymentType: "lnurl",
      lnurl: destinationText,
    }
  }

  if (protocol === "lightning" || destinationText.match(/^ln(bc|tb)/iu)) {
    if (
      (network === "mainnet" && !protocol.startsWith("lnbc")) ||
      (network === "testnet" && !protocol.startsWith("lntb")) ||
      (network === "regtest" && !protocol.startsWith("lnbcrt"))
    ) {
      return {
        valid: false,
        paymentType: "lightning",
        errorMessage: `Invalid lightning invoice for ${network} network`,
      }
    }

    let payReq: bolt11.PaymentRequestObject | undefined = undefined
    try {
      payReq = bolt11.decode(destinationText)
    } catch (err) {
      console.error(err)
      return { valid: false }
    }
    const sameNode = pubKey === getDestination(payReq)

    const amount =
      payReq.satoshis || payReq.millisatoshis
        ? payReq.satoshis ?? Number(payReq.millisatoshis) / 1000
        : undefined

    if (lightningInvoiceHasExpired(payReq)) {
      return {
        valid: false,
        errorMessage: "invoice has expired",
        paymentType: "lightning",
      }
    }

    const memo = getDescription(payReq)
    return {
      valid: true,
      paymentRequest: destinationText,
      amount,
      memo,
      paymentType: "lightning",
      sameNode,
    }
  }

  if (protocol === "onchain" || destinationText.match(/^(1|3|bc1|tb1|bcrt1)/iu)) {
    try {
      const decodedData = url.parse(destinationText, true)

      // some apps encode addresses in UPPERCASE
      const path = decodedData?.pathname?.toLocaleLowerCase()
      if (!path) {
        throw new Error("No address detected in decoded destination")
      }

      let amount: number | undefined = undefined
      try {
        amount = decodedData?.query?.amount
          ? parseAmount(decodedData.query.amount as string)
          : undefined
      } catch (err) {
        console.error(`can't decode amount ${err}`)
        return {
          valid: false,
          errorMessage: "Invalid amount in destination",
        }
      }

      // will throw if address is not valid
      address.toOutputScript(path, networks[network === "mainnet" ? "bitcoin" : network])
      return {
        valid: true,
        paymentType: "onchain",
        address: path,
        amount,
      }
    } catch (err) {
      console.error(`issue with payment destination: ${err}`)
      return {
        valid: false,
        errorMessage: "Invalid bitcoin address",
      }
    }
  }

  // No payment type detected, assume intraledger

  const handle = protocol.match(/^(http|\/\/)/iu) ? data.split("/").at(-1) : protocol
  return {
    valid: true,
    paymentType: "intraledger",
    handle,
  }
}
