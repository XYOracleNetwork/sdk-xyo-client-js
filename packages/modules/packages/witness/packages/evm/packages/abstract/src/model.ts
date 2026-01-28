import { asSchema, type Payload } from '@xyo-network/payload-model'

export const EvmAddressSchema = asSchema('network.xyo.evm.address', true)
export type EvmAddressSchema = typeof EvmAddressSchema

export type EvmAddress = Payload<
  {
    address?: string
    blockTag?: string | number
    chainId?: number
  },
  EvmAddressSchema
>
