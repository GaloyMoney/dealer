import { ChangeEvent, useState, memo, useEffect } from "react"
import { useDebouncedCallback } from "use-debounce"

export type OnTextValueChange = (numberValue: string) => void

type Props = {
  onChange?: OnTextValueChange
  onDebouncedChange?: OnTextValueChange
  [prop: string]: unknown
}

type InputObject = {
  value: string
  debouncedValue?: string
  typing: boolean
}

const DebouncedTextarea = ({ onChange, onDebouncedChange, ...textAreaProps }: Props) => {
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

  const handleOnChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value
    if (onChange) {
      onChange(newValue)
    }
    setInput({ value: newValue, typing: true })
  }

  return <textarea value={input.value} onChange={handleOnChange} {...textAreaProps} />
}

export default memo(DebouncedTextarea)
