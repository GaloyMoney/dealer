import { gql, useSubscription } from "@apollo/client"
import * as React from "react"

const QUERY_PRICE = gql`
  subscription price(
    $amount: SatAmount!
    $amountCurrencyUnit: ExchangeCurrencyUnit!
    $priceCurrencyUnit: ExchangeCurrencyUnit!
  ) {
    price(
      input: {
        amount: $amount
        amountCurrencyUnit: $amountCurrencyUnit
        priceCurrencyUnit: $priceCurrencyUnit
      }
    ) {
      errors {
        message
      }
      price {
        base
        offset
        currencyUnit
        formattedAmount
      }
    }
  }
`

const PRICE_CACHE_INTERVAL = 3 * 60 * 1000

const useSatPrice = () => {
  const { data, error } = useSubscription(QUERY_PRICE, {
    variables: {
      amount: 1,
      amountCurrencyUnit: "BTCSAT",
      priceCurrencyUnit: "USDCENT",
    },
  })

  // Price cache
  const [price, setPrice] = React.useState(0)
  const priceRef = React.useRef<number>(price)

  React.useEffect(() => {
    const priceTimerId = setInterval(() => {
      if (priceRef.current > 0) {
        setPrice(priceRef.current)
      }
    }, PRICE_CACHE_INTERVAL)
    return () => clearInterval(priceTimerId)
  }, [])

  if (error) {
    console.error(error) // TODO: Handle this case in the UI
  }

  if (data?.price?.price) {
    const { base, offset } = data.price.price
    priceRef.current = base / 10 ** offset
    if (price === 0) {
      setPrice(priceRef.current)
    }
  }

  return React.useMemo(
    () => ({
      price,
      satsToUsd: (sats: number) => (price > 0 ? (sats * price) / 100 : NaN),
      usdToSats: (usd: number) => (price > 0 ? (100 * usd) / price : NaN),
    }),
    [price],
  )
}

export default useSatPrice
