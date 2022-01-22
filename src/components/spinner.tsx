type Props = { size?: SpinnerSize }

const Spinner = ({ size = "small" }: Props) => {
  if (size === "big") {
    return (
      <div className="spinner">
        <i aria-hidden className={`fas fa-spinner fa-spin fa-5x`} />
      </div>
    )
  }
  return <i aria-hidden className={`spinner fas fa-spinner fa-spin fa-lg`} />
}

export default Spinner
