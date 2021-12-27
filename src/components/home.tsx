import { useQuery } from "@apollo/client"

import QUERY_ME from "store/graphql/query.me"
import useAuthToken from "store/use-auth-token"

import Header from "./header"

const Home = () => {
  const { hasToken } = useAuthToken()

  const { data } = useQuery(QUERY_ME, {
    variables: { hasToken },
  })

  const me = data?.me
  const balance = me?.defaultAccount?.wallets?.[0]?.balance ?? 0

  return (
    <div className="home">
      <Header balance={balance} />
    </div>
  )
}

export default Home
