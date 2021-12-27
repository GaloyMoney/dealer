import { ChangeEvent, useState, memo } from "react"

const formatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
})

const parseInputValue = (
  inputValue: string,
): {
  numberValue: number
  formattedValue: string
} => {
  if (inputValue === "") {
    return {
      numberValue: NaN,
      formattedValue: "",
    }
  }
  const numberValue = Number(inputValue.replace(/[^0-9.]/gu, ""))
  const inputValueIncomplete = inputValue.match(/(\.[1-9]?0+|\.)$/u)
  const formattedValue =
    // Allaw fixing invalid input and typing the decimal part at the end
    Number.isNaN(numberValue) || inputValueIncomplete
      ? inputValue
      : formatter.format(numberValue)
  return {
    numberValue,
    formattedValue,
  }
}

type Props = {
  value: string
  onValueChange: OnFormattedValueChangeFunction
}

const FormattedInput = ({ value, onValueChange }: Props) => {
  const [input, setInput] = useState(parseInputValue(value))

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Block more than 2 decmial numbers or points in the input
    if (event.target.value.match(/(\.[0-9]{3,}$|\..*\.)/u)) {
      return
    }

    const parsedInputValue = parseInputValue(event.target.value)

    setInput(parsedInputValue)
    onValueChange(parsedInputValue)
  }

  return <input value={input.formattedValue} onChange={handleOnChange} />
}

export default memo(FormattedInput)
