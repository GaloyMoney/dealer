import { translate, translateUnknown } from "store/index"

type FCT = React.FC<{ message?: string }>

const ErrorMessage: FCT = ({ message = "Not able to generate invoice." }) => {
  return (
    <div className="error">
      {translateUnknown(message) as string}
      <br />
      {translate("Please try again later.")}
    </div>
  )
}

export default ErrorMessage
