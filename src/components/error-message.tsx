import { translate } from "@galoymoney/client"

type FCT = React.FC<{ message?: string }>

const ErrorMessage: FCT = ({ message = "Not able to generate invoice." }) => (
  <div className="error">
    {translate(message as never)}
    <br />
    {translate("Please try again later.")}
  </div>
)

export default ErrorMessage
