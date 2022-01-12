import config from "store/config"

type Props = { error: string | Error }

const ErrorFallback = ({ error }: Props) => {
  const { message, stack } = error instanceof Error ? error : new Error(error)

  return (
    <div className="error-fallback" role="alert">
      <p>
        Sorry, we appear to be having issues loading the application data. If the problem
        persists, please contact support
      </p>

      <pre className="error">{message}</pre>

      <a
        href={`mailto:${config.supportEmail}?subject=Web Wallet Problem: ${message}&body=%0D%0A%0D%0A%0D%0AProblem details: %0D%0A%0D%0A${stack}`}
      >
        Email Support
      </a>
      <span className="separator">|</span>
      <a href="/">Reload App</a>
    </div>
  )
}

export default ErrorFallback
