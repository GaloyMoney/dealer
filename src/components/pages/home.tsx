import { translate } from "@galoymoney/client"
import useAuthToken from "../../store/use-auth-token"
import Header from "../header"
import TransactionList from "../transactions/list"

const Home = () => {
  const { hasToken } = useAuthToken()
  return (
    <>
      <div className="home">
        <Header page="home" />
        <div className="recent-transactions">
          {hasToken && (
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
