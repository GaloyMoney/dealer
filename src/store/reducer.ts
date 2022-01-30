const mainReducer = (state: GwwState, action: GwwAction): GwwState => {
  const { type, ...newState } = action

  switch (type) {
    case "update":
      return { ...state, ...newState, key: Math.random() }
    default:
      throw new Error("UNSUPPORTED_ACTION")
  }
}

export default mainReducer
