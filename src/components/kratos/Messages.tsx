import { UiText } from "@ory/kratos-client"

import { TranslationKey, translate, translateUnknown } from "store/index"

interface MessageProps {
  message: UiText
}

const kratosMessages: Record<number, TranslationKey> = {
  1060001: "You successfully recovered your account. Please change your password.",
  4000005: "Password is too short",
  4000006: "Invalid email or password",
  4000007: "An account with the same email exists already",
}

const messageText = (message: UiText): string => {
  const text = kratosMessages[message.id]

  if (text) {
    return translate(text)
  }

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
