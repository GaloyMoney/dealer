import { translate } from "@galoymoney/client"
import { Icon } from "@galoymoney/react"
import { useAuthContext } from "store/use-auth-context"

type FCT = React.FC<{ guestView: boolean }>

const EmailSetting: FCT = ({ guestView }) => {
  const { authIdentity } = useAuthContext()

  if (!authIdentity || !authIdentity?.emailAddress) {
    return null
  }

  const emailAddress = authIdentity?.emailAddress

  return (
    <div className="setting">
      <div className="icon">
        <Icon name="email" />
      </div>
      <div className="name">
        {translate("Email")}
        <div className="sub">{guestView ? "(not logged in)" : emailAddress}</div>
      </div>
      <div className="action">
        <Icon name="lock" />
      </div>
    </div>
  )
}

export default EmailSetting
