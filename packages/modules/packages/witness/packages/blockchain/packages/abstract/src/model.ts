import { Payload } from '@xyo-network/payload-model'

export const BlockchainAddressSchema = 'network.xyo.blockchain.address'
export type BlockchainAddressSchema = typeof BlockchainAddressSchema

export type BlockchainAddress = Payload<
  {
    address?: string
    blockTag?: string | number
    chainId?: number
  },
  BlockchainAddressSchema
>
