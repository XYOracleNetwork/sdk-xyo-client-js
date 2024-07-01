import { Payload } from '@xyo-network/payload-model'

/** @deprecated use EvmAddressSchema version instead */
export const BlockchainAddressSchema = 'network.xyo.blockchain.address' as const

/** @deprecated use EvmAddressSchema version instead */
// eslint-disable-next-line deprecation/deprecation
export type BlockchainAddressSchema = typeof BlockchainAddressSchema

/** @deprecated use EvmAddress version instead */
export type BlockchainAddress = Payload<
  {
    address?: string
    blockTag?: string | number
    chainId?: number
  },
  // eslint-disable-next-line deprecation/deprecation
  BlockchainAddressSchema
>
