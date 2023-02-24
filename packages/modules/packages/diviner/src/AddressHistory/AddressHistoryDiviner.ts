import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { DivinerConfig } from '@xyo-network/diviner-model'

import { AbstractDiviner } from '../AbstractDiviner'

export type MemoryAddressHistoryDivinerConfigSchema = 'network.xyo.diviner.address.history.memory.config'
export const MemoryAddressHistoryDivinerConfigSchema = 'network.xyo.diviner.address.history.memory.config'

export type MemoryAddressHistoryDivinerConfig = DivinerConfig<
  XyoBoundWitness,
  {
    address: string
    max?: number
    offset?: string
    schema: MemoryAddressHistoryDivinerConfigSchema
  }
>

export type AddressHistoryDiviner = AbstractDiviner
