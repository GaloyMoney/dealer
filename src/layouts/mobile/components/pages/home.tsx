import { translate } from "@galoymoney/client"
import { Icon } from "@galoymoney/react"

import ContactListForSending from "components/contact-list-for-sending"
import Footer from "components/footer"
import Header from "components/header"
import Link from "components/link"

const Home: NoPropsFCT = () => {
  return (
    <div className="home">
      <Header page="home" />

      <ContactListForSending />

      <div className="buttons">
        <Link to="/send" className="button">
          <Icon name="send" />
          {translate("Send")}
        </Link>
        <Link to="/receive" className="button">
          <Icon name="receive" />
          {translate("Receive")}
        </Link>
      </div>

      <Footer page="home" />
    </div>
  )
}

export default Home
