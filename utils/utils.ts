import { ParsedUrlQuery } from "querystring"

export const usdFormatter = new Intl.NumberFormat("en-US", {
  // style: "currency",
  // currency: "USD",
  maximumFractionDigits: 0,
})

export const satsFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

export function formatOperand(operand: string | undefined) {
  if (operand == null || isNaN(Number(operand))) return `0.00`
  const [integer, decimal] = operand.split(".")
  if (decimal == null) {
    return usdFormatter.format(Number(integer))
  }
  return `${usdFormatter.format(Number(integer))}.${decimal}`
}

export function parseQueryAmount(query: ParsedUrlQuery) {
  const currency = query.currency as string | null

  return {
    amount: Number(query.amount) || 0,
    currency: currency?.toUpperCase() || "USD",
  }
}
