import { useState } from "react"
import { useOneSatPrice } from "../../helpers/use-currency-conversion"

export default function AmountInput({
  callbackSatsAmount,
}: {
  callbackSatsAmount: (amount: number) => void
}) {
  const [satsActive, setSatsActive] = useState(false)
  const [textFieldPrettyValue, setTextFieldPrettyValue] = useState("0.00")
  const [textFieldRawValue, setTextFieldRawValue] = useState("")

  const { oneSatToCents, error: satError } = useOneSatPrice()

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  })

  const setAmountInTextField = (
    e: React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
  ) => {
    const re = /^[0-9\b]+$/
    let updatedStr

    // If backspace key is pressed
    if (e.key === "Backspace") {
      updatedStr = textFieldRawValue.substring(0, textFieldRawValue.length - 1)
    } else {
      updatedStr = textFieldRawValue + e.key
    }

    // Only accept numbers, commas, and periods
    if (!(updatedStr === "" || re.test(updatedStr))) return

    setTextFieldRawValue(updatedStr)
    if (satsActive) {
      callbackSatsAmount(parseInt(updatedStr))
      setTextFieldPrettyValue(updatedStr)
    } else {
      if (updatedStr === "") {
        setTextFieldPrettyValue("0.00")
        callbackSatsAmount(0)
        return
      }
      let textFieldStr = formatter.format(parseFloat(updatedStr) / 100)
      textFieldStr = textFieldStr.replace("$", "")
      setTextFieldPrettyValue(textFieldStr)
      callbackSatsAmount(parseInt(convertUsdToSats(textFieldStr)))
    }
  }

  const convertSatsToUsd = (str: string) => {
    const amountFloat = parseFloat(str)
    const usdCentValue = (amountFloat * oneSatToCents) / 100
    let amountFloatRounded = usdCentValue.toFixed(2).toString()
    if (amountFloatRounded === "NaN") amountFloatRounded = "0.00"
    return amountFloatRounded
  }

  const convertUsdToSats = (str: string) => {
    const amountTextStripped = str.replace(",", "")
    const amountFloat = parseFloat(amountTextStripped)
    const satValue = Math.floor((amountFloat * 100) / oneSatToCents)
    return satValue.toString()
  }

  const toggleSats = () => {
    if (satsActive) {
      const amountFloatRounded = convertSatsToUsd(textFieldPrettyValue)
      setTextFieldPrettyValue(amountFloatRounded)
      setTextFieldRawValue(amountFloatRounded.replace(".", ""))
    } else {
      const satValue = convertUsdToSats(textFieldPrettyValue)
      setTextFieldPrettyValue(satValue)
      setTextFieldRawValue(satValue)
    }
    setSatsActive(!satsActive)
  }

  if (satsActive)
    return (
      <div>
        <span>SATS</span>
        <input
          style={{ width: "80%" }}
          value={textFieldPrettyValue}
          onKeyDown={setAmountInTextField}
          onChange={undefined}
        />
        <span onClick={toggleSats}>&#8645;</span>
        <p>{formatter.format(parseFloat(convertSatsToUsd(textFieldPrettyValue)))}</p>
      </div>
    )

  return (
    <div>
      <span> $ </span>
      <input
        style={{ width: "80%" }}
        value={textFieldPrettyValue}
        onKeyDown={setAmountInTextField}
        onChange={undefined}
      />
      <span onClick={toggleSats}>&#8645;</span>
      <p>SATS {convertUsdToSats(textFieldPrettyValue)}</p>
    </div>
  )
}
