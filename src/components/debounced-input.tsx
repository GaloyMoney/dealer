import { ChangeEvent, useState, memo, useEffect } from "react"
import { useDebouncedCallback } from "use-debounce"

export type OnInputValueChange = (value: string) => void

type Props = {
  onChange?: OnInputValueChange
  onDebouncedChange?: OnInputValueChange
  [prop: string]: unknown
}

type InputObject = {
  value: string
  debouncedValue?: string
  typing: boolean
}

const DebouncedInput = ({ onChange, onDebouncedChange, ...inputProps }: Props) => {
  const [input, setInput] = useState<InputObject>({ value: "", typing: false })

  const setDebouncedInputValue = useDebouncedCallback((debouncedValue) => {
    setInput((currInput) => ({ ...currInput, debouncedValue, typing: false }))
  }, 1000)

  useEffect(() => {
    if (input.typing) {
      setDebouncedInputValue(input.value)
    }
    return () => setDebouncedInputValue.cancel()
  }, [setDebouncedInputValue, input.typing, input.value])

  useEffect(() => {
    if (onDebouncedChange && input.debouncedValue !== undefined) {
      onDebouncedChange(input.debouncedValue)
    }
  }, [onDebouncedChange, input.debouncedValue])

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    if (onChange) {
      onChange(newValue)
    }
    setInput({ value: newValue, typing: true })
  }

  return <input value={input.value} onChange={handleOnChange} {...inputProps} />
}

export default memo(DebouncedInput)
