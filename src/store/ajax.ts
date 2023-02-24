const get = async (path: string, params?: Record<string, string | number | boolean>) => {
  try {
    const url = new URL(path)
    if (params) {
      url.search = new URLSearchParams(JSON.stringify(params)).toString()
    }

    const response = await fetch(url.toString(), {
      method: "get",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })

    return response.json()
  } catch (err) {
    return err
  }
}

const post = async (
  path: string,
  params: Record<string, string | number | boolean> = {},
) => {
  try {
    const response = await fetch(path, {
      method: "post",
      body: JSON.stringify(params),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })

    return response.json()
  } catch (err) {
    return err
  }
}

export const ajax = { get, post }
