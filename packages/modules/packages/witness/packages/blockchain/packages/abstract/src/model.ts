/* eslint-disable deprecation/deprecation */
import { Payload } from '@xyo-network/payload-model'

/** @deprecated use EvmAddressSchema version instead */
export const BlockchainAddressSchema = 'network.xyo.blockchain.address'

/** @deprecated use EvmAddressSchema version instead */
export type BlockchainAddressSchema = typeof BlockchainAddressSchema

/** @deprecated use EvmAddress version instead */
export type BlockchainAddress = Payload<
  {
    address?: string
    blockTag?: string | number
    chainId?: number
  },
  BlockchainAddressSchema
>
