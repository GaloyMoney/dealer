import { UiText } from "@ory/client"

import { translateUnknown } from "store/index"

interface MessageProps {
  message: UiText
}

// FIXME: Kratos uses different texts under the same message ID!
// Can't lookup a message by these IDs

// 1060001: "You successfully recovered your account. Please change your password.",
// 4000005: "Password is too short",
// 4000006: "Invalid email or password",
// 4000007: "An account with the same email exists already",

const messageText = (message: UiText): string => {
  return translateUnknown(message.text) as string
}

export const Message = ({ message }: MessageProps) => {
  return <div className={`${message.type}-message`}>{messageText(message)}</div>
}

interface MessagesProps {
  messages?: Array<UiText>
}

export const Messages = ({ messages }: MessagesProps) => {
  if (!messages) {
    // No messages? Do nothing.
    return null
  }

  return (
    <div className="form-messages">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  )
}
