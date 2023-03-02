import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { DivinerConfig } from '@xyo-network/diviner-model'

import { AddressChainSchema } from './Diviner'

export type AddressChainDivinerConfigSchema = `${AddressChainSchema}.config`
export const AddressChainDivinerConfigSchema: AddressChainDivinerConfigSchema = `${AddressChainSchema}.config`

export type AddressChainDivinerConfig = DivinerConfig<
  XyoBoundWitness,
  {
    address: string
    maxResults?: number
    schema: AddressChainDivinerConfigSchema
    startHash: string
  }
>
