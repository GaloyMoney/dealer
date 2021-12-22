const mainReducer = (state: GwwState, action: GwwAction): GwwState => {
  const { type, ...newState } = action

  switch (type) {
    case "state":
      return { ...state, ...newState }
    case "logout":
      return { ...state, authToken: undefined }
    default:
      throw new Error("UNSUPPORTED_ACTION")
  }
}

export default mainReducer
