import { useQuery } from "urql"

import { useAppState } from "store"
import QUERY_ME from "store/graphql/query.me"

import Header from "./header"

const Home = () => {
  const { authToken } = useAppState()

  const [result] = useQuery({
    query: QUERY_ME,
    variables: { hasToken: Boolean(authToken) },
  })

  const me = result?.data?.me
  const balance = me?.defaultAccount?.wallets?.[0]?.balance ?? 0

  return (
    <div className="home">
      <Header balance={balance} />
    </div>
  )
}

export default Home
