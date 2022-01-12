const mainReducer = (state: GwwState, action: GwwAction): GwwState => {
  const { type, ...newState } = action

  switch (type) {
    case "navigate":
      return { ...state, ...newState }
    case "reset-current-screen":
      return { ...state, key: Math.random() }
    default:
      throw new Error("UNSUPPORTED_ACTION")
  }
}

export default mainReducer
