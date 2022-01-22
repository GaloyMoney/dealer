const faSize = (size: SpinnerSize): string => {
  switch (size) {
    case "small":
      return "fa-lg"
    case "big":
      return "fa-5x"
    default:
      return ""
  }
}

type Props = { size?: SpinnerSize }

const Spinner = ({ size = "small" }: Props) => {
  return <i aria-hidden className={`spinner fas fa-spinner fa-spin ${faSize(size)}`} />
}

export default Spinner
