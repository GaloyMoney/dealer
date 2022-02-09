import { translate } from "@galoymoney/client"
import { useAuthContext } from "../../store/use-auth-context"
import Header from "../header"
import TransactionList from "../transactions/list"

const Home = () => {
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
      <div id="footer">
        <div className="powered-by">
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
