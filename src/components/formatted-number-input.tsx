import { ChangeEvent, useState, memo, useEffect } from "react"
import { useDebouncedCallback } from "use-debounce"

const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })

export type ParsieInputValueFunction = (inputValue: string) => {
  numberValue: number | ""
  formattedValue: string
}

const parseInputValue: ParsieInputValueFunction = (inputValue) => {
  if (inputValue === "") {
    return { numberValue: "", formattedValue: "" }
  }

  const numberValue = Number(inputValue.replace(/[^0-9.]/gu, ""))
  const inputValueIncomplete = inputValue.match(/(\.[1-9]?0+|\.)$/u)
  const formattedValue =
    // Allaw fixing invalid input and typing the decimal part at the end
    Number.isNaN(numberValue) || inputValueIncomplete
      ? inputValue
      : formatter.format(numberValue)

  return { numberValue, formattedValue }
}

export type OnNumberValueChange = (numberValue: number | "") => void

type Props = {
  value: string
  onChange?: OnNumberValueChange
  onDebouncedChange?: OnNumberValueChange
  [prop: string]: unknown
}

type InputObject = {
  numberValue: number | ""
  formattedValue: string
  debouncedValue?: number | ""
  typing: boolean
}

const FormattedNumberInput = ({
  value,
  onChange,
  onDebouncedChange,
  ...inputProps
}: Props) => {
  const [input, setInput] = useState<InputObject>(() => ({
    ...parseInputValue(value),
    typing: false,
  }))

  const setDebouncedInputValue = useDebouncedCallback((debouncedValue) => {
    setInput((currInput) => ({ ...currInput, debouncedValue, typing: false }))
  }, 1000)

  useEffect(() => {
    if (input.typing) {
      setDebouncedInputValue(input.numberValue)
    }
    return () => setDebouncedInputValue.cancel()
  }, [setDebouncedInputValue, input.typing, input.numberValue])

  useEffect(() => {
    if (onDebouncedChange && input.debouncedValue !== undefined) {
      onDebouncedChange(input.debouncedValue)
    }
  }, [onDebouncedChange, input.debouncedValue])

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Block more than 2 decmial numbers or points in the input
    if (event.target.value.match(/(\.[0-9]{3,}$|\..*\.)/u)) {
      return
    }
    const { numberValue, formattedValue } = parseInputValue(event.target.value)
    if (onChange) {
      onChange(numberValue)
    }
    setInput({ numberValue, formattedValue, typing: true })
  }

  return <input value={input.formattedValue} onChange={handleOnChange} {...inputProps} />
}

export default memo(FormattedNumberInput)
