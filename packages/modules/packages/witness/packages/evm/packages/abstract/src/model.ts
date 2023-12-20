import { Payload } from '@xyo-network/payload-model'

export const EvmAddressSchema = 'network.xyo.evm.address'
export type EvmAddressSchema = typeof EvmAddressSchema

export type EvmAddress = Payload<
  {
    address?: string
    blockTag?: string | number
    chainId?: number
  },
  EvmAddressSchema
>
