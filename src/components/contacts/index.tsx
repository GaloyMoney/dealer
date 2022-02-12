import { translate, useQuery } from "@galoymoney/client"
import { Icon, Spinner } from "@galoymoney/react"

import { history } from "../../store"
import ErrorMessage from "../error-message"
import Header from "../header"

const nameDisplay = (name: string): string => {
  if (name.length > 15) {
    return name.substring(0, 15) + "..."
  }

  return name
}

const Contacts = () => {
  const { loading, errorsMessage, data } = useQuery.contacts()

  const handleSendBitcoin = (contactUsername: string) => {
    history.push(`/send?to=${contactUsername}`)
  }

  const showContactDetails = (contactUsername: string) => {
    history.push(`/transactions?username=${contactUsername}`)
  }

  return (
    <div className="contacts">
      <Header page="contacts" />

      <div className="page-title">{translate("Contacts")}</div>
      <div className="list">
        {loading && <Spinner size="big" />}

        {errorsMessage && <ErrorMessage message={errorsMessage} />}

        {data?.me?.contacts.map((contact) => {
          return (
            <div key={contact.username} className="contact">
              <Icon name="person" />
              <div className="name" onClick={() => handleSendBitcoin(contact.username)}>
                {nameDisplay(contact.alias ?? contact.username)}
              </div>
              <div className="actions">
                <div
                  title={translate("Transaction List")}
                  onClick={() => showContactDetails(contact.username)}
                >
                  <Icon name="list" />
                </div>
                <div
                  title={translate("Send Bitcoin")}
                  onClick={() => handleSendBitcoin(contact.username)}
                >
                  <Icon name="send" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Contacts
