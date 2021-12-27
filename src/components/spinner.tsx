const faSize = (size: SpinnerSize): string => {
  switch (size) {
    case "small":
      return "fa-lg"
    case "big":
      return "fa-10x"
    default:
      return ""
  }
}

type Props = { size?: SpinnerSize }

const Spinner = ({ size = "small" }: Props) => {
  return <i className={`fas fa-spinner fa-spin ${faSize(size)}`} />
}

export default Spinner
