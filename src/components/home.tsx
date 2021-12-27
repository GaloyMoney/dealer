import { translate } from "translate"
import Header from "./header"
import Link from "./link"

const Home = () => {
  return (
    <div className="home">
      <Header />
      <div className="links">
        <div>
          <Link to="/send">{translate("Send")}</Link>
        </div>
        <div>
          <Link to="/receive">{translate("Receive")}</Link>
        </div>
      </div>
    </div>
  )
}

export default Home
