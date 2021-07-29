declare global {
  interface Window {
    opera: string
    env: Record<string, string>
    lightningPayReq: {
      decode: (paymentRequest: string, network?: Network) => PaymentRequestObject
    }
  }
}

// ****** From BOLT11 ******
type RoutingInfo = Array<{
  pubkey: string
  short_channel_id: string
  fee_base_msat: number
  fee_proportional_millionths: number
  cltv_expiry_delta: number
}>
type FallbackAddress = {
  code: number
  address: string
  addressHash: string
}
type FeatureBits = {
  word_length: number
  option_data_loss_protect?: Feature
  initial_routing_sync?: Feature
  option_upfront_shutdown_script?: Feature
  gossip_queries?: Feature
  var_onion_optin?: Feature
  gossip_queries_ex?: Feature
  option_static_remotekey?: Feature
  payment_secret?: Feature
  basic_mpp?: Feature
  option_support_large_channel?: Feature
  extra_bits?: {
    start_bit: number
    bits: boolean[]
    has_required?: boolean
  }
}
type Feature = {
  required?: boolean
  supported?: boolean
}
type Network = {
  [index: string]: unknown
  bech32: string
  pubKeyHash: number
  scriptHash: number
  validWitnessVersions: number[]
}
export declare type TagData =
  | string
  | number
  | RoutingInfo
  | FallbackAddress
  | FeatureBits
export declare type PaymentRequestObject = {
  paymentRequest?: string
  complete?: boolean
  prefix?: string
  wordsTemp?: string
  network?: Network
  satoshis?: number | null
  millisatoshis?: string | null
  timestamp?: number
  timestampString?: string
  timeExpireDate?: number
  timeExpireDateString?: string
  payeeNodeKey?: string
  signature?: string
  recoveryFlag?: number
  tags: Array<{
    tagName: string
    data: TagData
  }>
}
// *************************

export {}
