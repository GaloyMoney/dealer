import { translate } from "@galoymoney/client"
import { Icon } from "@galoymoney/react"

import { useAuthContext } from "../../store/use-auth-context"
import ContactListForSending from "../contact-list-for-sending"
import Footer from "../footer"

import Header from "../header"
import Link from "../link"
import TransactionList from "../transactions/list"

const Home = {} as LayoutComponent<Record<string, never>>

Home.Small = function Home() {
  return (
    <div className="home">
      <Header.Small page="home" />

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

Home.Large = function Home() {
  const { isAuthenticated } = useAuthContext()

  return (
    <>
      <div className="home">
        <Header.Large page="home" />
        <div className="recent-transactions">
          {isAuthenticated && (
            <>
              <div className="header">{translate("Recent Transactions")}</div>
              <TransactionList />
            </>
          )}
        </div>
      </div>

      <div id="powered-by">
        <div className="content">
          {translate("Powered By")}{" "}
          <a href="https://galoy.io/" target="_blank" rel="noreferrer">
            Galoy
          </a>
        </div>
      </div>
    </>
  )
}

export default Home
