import { Icon } from "@galoymoney/react"

import { translate, useAuthContext } from "store/index"

type FCT = React.FC<{ guestView: boolean }>

const EmailSetting: FCT = ({ guestView }) => {
  const { authIdentity } = useAuthContext()

  const emailAddress = authIdentity?.emailAddress

  return (
    <div className="setting">
      <div className="icon">
        <Icon name="at" />
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
