import { translate } from "@galoymoney/client"

import { useAuthContext } from "store/use-auth-context"

import Header from "components/header"
import TransactionList from "components/transactions/list"

const Home: NoPropsFCT = () => {
  const { isAuthenticated } = useAuthContext()

  return (
    <>
      <div className="home">
        <Header page="home" />
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
