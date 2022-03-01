import { useState } from "react"
import copy from "copy-to-clipboard"

import {
  initialsDisplay,
  translate,
  truncatedDisplay,
  useQuery,
} from "@galoymoney/client"
import { Icon, Spinner } from "@galoymoney/react"

import useMainQuery from "hooks/use-main-query"
import { history } from "store/index"
import config from "store/config"
import { useAuthContext } from "store/use-auth-context"

const ContactListForSending: NoPropsFCT = () => {
  const { isAuthenticated } = useAuthContext()
  const [showCopied, setShowCopied] = useState(false)

  const { username } = useMainQuery()
  const { loading, data } = useQuery.contacts({
    skip: !isAuthenticated,
  })

  const handleSendBitcoin = (contactUsername: string) => {
    history.push(`/send?to=${contactUsername}`)
  }

  const shareUri = `${config.shareUri}${username ?? ""}`

  const handleInvite = () => {
    if (!navigator.share) {
      copy(shareUri)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 3000)
      return
    }

    navigator
      .share({ title: `${config.walletName} Wallet`, url: shareUri })
      .catch(console.error)
  }

  return (
    <div className="contact-list-for-sending">
      <div className="contact link" onClick={handleInvite}>
        <div className="icon">
          <Icon name="invite" />
        </div>
        <div className="name">Invite</div>
      </div>

      {loading && <Spinner size="big" />}

      {data?.me?.contacts.map((contact) => {
        return (
          <div
            key={contact.username}
            className="contact link"
            onClick={() => handleSendBitcoin(contact.username)}
          >
            <div className="icon">
              {initialsDisplay(contact.alias ?? contact.username)}
            </div>
            <div className="name">
              {truncatedDisplay(contact.alias ?? contact.username, { max: 10 })}
            </div>
          </div>
        )
      })}

      {showCopied && (
        <div className="link-copied">
          {translate("Link has been copied to the clipboard")}
        </div>
      )}
    </div>
  )
}

export default ContactListForSending
