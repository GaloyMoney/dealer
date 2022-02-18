import ReceiveSmall from "../receive/layout-small"
import ReceiveLarge from "../receive/layout-large"

const Receive = {} as LayoutComponent<Record<string, never>>

Receive.Large = ReceiveLarge

Receive.Small = ReceiveSmall

export default Receive
