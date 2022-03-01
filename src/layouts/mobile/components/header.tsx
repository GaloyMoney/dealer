import useMainQuery from "hooks/use-main-query"

import Balance from "components/balance"

const headerNavPages = ["home", "send-bitcoin", "receive-bitcoin"] as const

type Page = typeof headerNavPages[number] | "contacts" | "transactions" | "settings"

type FCT = React.FC<{ page: Page }>

const Header: FCT = ({ page }) => {
  const { btcWalletBalance } = useMainQuery()

  return (
    <div className={`header-container ${page}-header`}>
      <div className="header">
        <Balance balance={btcWalletBalance} />
      </div>
    </div>
  )
}

export default Header
