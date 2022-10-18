import { useRouter } from "next/router"

const CheckUsername = () => {
  const router = useRouter()
  // get the username from local storage
  const username_from_local = localStorage.getItem("username")
  if (!username_from_local || username_from_local === null) {
    router.push({
      pathname: `/`,
      query: undefined,
    })
  }

  // forward the user to the appropriate url using username
  // from local storage
  router.push({
    pathname: `/merchant/${username_from_local}`,
    query: undefined,
  })

  return null
}

export default CheckUsername
