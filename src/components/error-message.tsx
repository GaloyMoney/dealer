import { translate, translateUnknown } from "@galoymoney/client"

type FCT = React.FC<{ message?: string }>

const ErrorMessage: FCT = ({ message = "Not able to generate invoice." }) => (
  <div className="error">
    {translateUnknown(message)}
    <br />
    {translate("Please try again later.")}
  </div>
)

export default ErrorMessage
