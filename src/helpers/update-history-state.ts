const updateHistoryState = (inObj: Record<string, string | number>) => {
  if (!(inObj instanceof Object)) {
    throw new Error("Object required")
  }
  const qs = "?" + objectToQueryString(inObj)
  if (qs === location.search) {
    return
  }
  history.replaceState(null, "", location.pathname + (qs !== "?" ? qs : ""))
}

export const objectToQueryString = (inObj: Record<string, string | number>) => {
  const qs = new URLSearchParams()
  Object.entries(inObj).forEach(([key, value]) =>
    value !== undefined ? qs.append(key, value.toString()) : null,
  )
  return qs.toString()
}

export default updateHistoryState
