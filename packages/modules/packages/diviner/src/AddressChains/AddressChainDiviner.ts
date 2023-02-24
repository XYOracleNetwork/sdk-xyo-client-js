import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { DivinerConfig } from '@xyo-network/diviner-model'

import { AbstractDiviner } from '../AbstractDiviner'

export type MemoryAddressChainsDivinerConfigSchema = 'network.xyo.diviner.address.chains.memory.config'
export const MemoryAddressChainsDivinerConfigSchema: MemoryAddressChainsDivinerConfigSchema = 'network.xyo.diviner.address.chains.memory.config'

export type MemoryAddressChainsDivinerConfig = DivinerConfig<
  XyoBoundWitness,
  {
    address: string
    schema: MemoryAddressChainsDivinerConfigSchema
  }
>

export type AddressChainsDiviner = AbstractDiviner
