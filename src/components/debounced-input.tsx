import { ChangeEvent, useState, memo, useEffect } from "react"
import { useDebouncedCallback } from "use-debounce"

export type OnInputValueChange = (value: string) => void

type Props = {
  newValue: string | undefined
  onChange?: OnInputValueChange
  onDebouncedChange?: OnInputValueChange
  [prop: string]: unknown
}

type InputObject = {
  value: string
  debouncedValue?: string
  typing: boolean
}

const DebouncedInput = ({
  newValue,
  onChange,
  onDebouncedChange,
  ...inputProps
}: Props) => {
  const [input, setInput] = useState<InputObject>({ value: "", typing: false })

  const setDebouncedInputValue = useDebouncedCallback((debouncedValue) => {
    setInput((currInput) => ({ ...currInput, debouncedValue, typing: false }))
  }, 1500)

  useEffect(() => {
    if (newValue !== undefined) {
      setInput({ value: newValue, typing: false })
    }
  }, [newValue])

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
    const eventValue = event.target.value
    if (onChange) {
      onChange(eventValue)
    }
    setInput({ value: eventValue, typing: true })
  }

  return <input value={input.value} onChange={handleOnChange} {...inputProps} />
}

export default memo(DebouncedInput)
