import { useState } from "react"

const messages = {
  emailVerified: "Your email address has been verified",
}

type FCT = React.FC<{ type: keyof typeof messages }>

const DiscardableMessage: FCT = ({ type }) => {
  const [shown, setShown] = useState(true)

  if (!shown) {
    return null
  }

  return (
    <div className="discardable-message">
      <div className="close link" onClick={() => setShown(false)}>
        X
      </div>
      <div className="message">{messages[type]}</div>
    </div>
  )
}

export default DiscardableMessage
