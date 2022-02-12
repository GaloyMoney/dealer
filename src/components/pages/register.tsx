import { SelfServiceRegistrationFlow } from "@ory/kratos-client"
import { useState } from "react"
import { getUrlForFlow, KratosFlow } from "../../kratos"
import config from "../../store/config"

interface RegisterProps {
  flowData?: KratosFlowData
}

const Register = ({ flowData: flowDataProp }: RegisterProps) => {
  const [flowData] = useState<SelfServiceRegistrationFlow | undefined>(
    flowDataProp?.registrationData,
  )

  if (!flowData) {
    window.location.href = getUrlForFlow({
      flow: KratosFlow.Registration,
      kratosBrowserUrl: config.kratosBrowserUrl,
    })
    return <></>
  }

  return <div className="register">{JSON.stringify(flowData)}</div>
}

export default Register
