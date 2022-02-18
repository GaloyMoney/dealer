import SendSmall from "../send/layout-small"
import SendLarge from "../send/layout-large"

const Send = {} as LayoutComponent<{ to?: string }>

Send.Small = SendSmall

Send.Large = SendLarge

export default Send
