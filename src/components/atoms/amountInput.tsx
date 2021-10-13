import { useState } from "react"
import { useOneSatPrice } from "../../helpers/use-currency-conversion"

export default function AmountInput({
  callbackAmount,
}: {
  callbackAmount: (text: string) => void
}) {
  const [satsActive, setSatsActive] = useState(false)
  const [rawAmountText, setRawAmountText] = useState("0")
  const [amountText, setAmountText] = useState("0.00")

  const { oneSatToCents, error: satError } = useOneSatPrice()

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  })

  const setAmount = (
    e: React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
  ) => {
    const re = /^[0-9\b]+$/
    let updatedStr

    // If backspace key is pressed
    if (e.key === "Backspace") {
      updatedStr = rawAmountText.substring(0, rawAmountText.length - 1)
    } else updatedStr = rawAmountText + e.key

    // Only accept numbers, commas, and periods
    if (!(updatedStr === "" || re.test(updatedStr))) return

    setRawAmountText(updatedStr)
    if (satsActive) {
      setAmountText(updatedStr)
      callbackAmount(updatedStr)
    } else {
      let textFieldStr = formatter.format(parseFloat(updatedStr) / 100)
      textFieldStr = textFieldStr.replace("$", "")
      if (textFieldStr === "NaN") textFieldStr = "0.00"
      setAmountText(textFieldStr)
      callbackAmount(textFieldStr)
    }
  }

  const convertSatsToUsd = (str: string) => {
    const amountFloat = parseFloat(str)
    const usdCentValue = amountFloat / oneSatToCents
    let amountFloatRounded = usdCentValue.toFixed(2).toString()
    if (amountFloatRounded === "NaN") amountFloatRounded = "0.00"
    return amountFloatRounded
  }

  const convertUsdToSats = (str: string) => {
    const amountTextStripped = str.replace(",", "")
    const amountFloat = parseFloat(amountTextStripped)
    const satValue = Math.floor(amountFloat * oneSatToCents)
    return satValue
  }

  const toggleSats = () => {
    if (satsActive) {
      const amountFloatRounded = convertSatsToUsd(amountText)
      setAmountText(amountFloatRounded)
      setRawAmountText(amountFloatRounded.replace(".", ""))
      callbackAmount(amountFloatRounded)
    } else {
      const satValue = convertUsdToSats(amountText)
      const satString = satValue.toString()
      setAmountText(satString)
      setRawAmountText(satString)
      callbackAmount(satString)
    }
    setSatsActive(!satsActive)
  }

  if (satsActive)
    return (
      <div>
        <span>SATS</span>
        <input
          style={{ width: "80%" }}
          value={amountText}
          onKeyDown={setAmount}
          onChange={undefined}
        />
        <span onClick={toggleSats}>&#8645;</span>
        <p>{formatter.format(parseFloat(convertSatsToUsd(amountText)))}</p>
      </div>
    )

  return (
    <div>
      <span> $ </span>
      <input
        style={{ width: "80%" }}
        value={amountText}
        onKeyDown={setAmount}
        onChange={undefined}
      />
      <span onClick={toggleSats}>&#8645;</span>
      <p>SATS {convertUsdToSats(amountText)}</p>
    </div>
  )
}
