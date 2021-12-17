import { useContext } from "react"
import GwwContext from "store"
import { gql, useQuery } from "urql"
import Header from "./header"

const QUERY_ME = gql`
  query me($hasToken: Boolean!) {
    me @include(if: $hasToken) {
      id
      username
      defaultAccount {
        id
        wallets {
          id
          balance
        }
      }
    }
  }
`
const Home = () => {
  const { state } = useContext<GwwContextType>(GwwContext)

  const [result] = useQuery({
    query: QUERY_ME,
    variables: { hasToken: Boolean(state.authToken) },
  })

  const balance = result?.data?.me?.defaultAccount?.wallets?.[0]?.balance ?? 0

  return (
    <div className="home">
      <Header balance={balance} />
    </div>
  )
}

export default Home
