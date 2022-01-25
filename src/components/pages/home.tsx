import { translate } from "@galoymoney/client"
import Header from "../header"

const Home = () => {
  return (
    <>
      <div className="home">
        <Header page="home" />
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
