import { SelfServiceRegistrationFlow } from "@ory/kratos-client"
import { useState } from "react"

interface RegisterProps {
  flowData?: KratosFlowData
}

const Register = ({ flowData: flowDataProp }: RegisterProps) => {
  const [flowData] = useState<SelfServiceRegistrationFlow | undefined>(
    flowDataProp?.registrationData,
  )

  return <div className="register">{JSON.stringify(flowData)}</div>
}

export default Register
