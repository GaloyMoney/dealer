import { gql, useSubscription } from "@apollo/client"

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

export const useOneSatPrice = () => {
  const { data, error } = useSubscription(QUERY_PRICE, {
    variables: {
      amount: 1,
      amountCurrencyUnit: "BTCSAT",
      priceCurrencyUnit: "USDCENT",
    },
  })

  const oneSatToCents = parseFloat(data?.price.price.formattedAmount)

  return { oneSatToCents, error }
}
