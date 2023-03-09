import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { DivinerConfig } from '@xyo-network/diviner-model'

import { AddressHistorySchema } from './Diviner'

export type AddressHistoryDivinerConfigSchema = `${AddressHistorySchema}.config`
export const AddressHistoryDivinerConfigSchema: AddressHistoryDivinerConfigSchema = `${AddressHistorySchema}.config`

export type AddressHistoryDivinerConfig = DivinerConfig<
  XyoBoundWitness,
  {
    address?: string
    schema: AddressHistoryDivinerConfigSchema
  }
>
