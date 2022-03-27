import { translate } from "@galoymoney/client"
import { Icon } from "@galoymoney/react"

import useMainQuery from "hooks/use-main-query"

type FCT = React.FC<{ guestView: boolean }>

const UsernameSetting: FCT = ({ guestView }) => {
  const { username } = useMainQuery()

  if (!username) {
    return null
  }

  return (
    <div className="setting">
      <div className="icon">
        <Icon name="person" />
      </div>
      <div className="name">
        {translate("Username")}
        <div className="sub">{guestView ? "(not logged in)" : username}</div>
      </div>
      <div className="action">
        <Icon name="lock" />
      </div>
    </div>
  )
}

export default UsernameSetting
