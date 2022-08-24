import { IconName, Icon as DefaultIcon } from "@galoymoney/react"

const Icon: React.FC<{ name: IconName }> = ({ name }) => {
  return <DefaultIcon name={name} />
}

export default Icon
