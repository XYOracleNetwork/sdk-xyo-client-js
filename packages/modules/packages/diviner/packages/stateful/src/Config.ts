import { DivinerConfig } from '@xyo-network/diviner-model'

import { StatefulDivinerSchema } from './Schema'

export const StatefulDivinerConfigSchema = `${StatefulDivinerSchema}.config` as const
export type StatefulDivinerConfigSchema = typeof StatefulDivinerConfigSchema

export type StatefulDivinerConfig = DivinerConfig<{
  schema: StatefulDivinerConfigSchema
  stateStore: {
    archivist: string
    boundWitnessDiviner: string
    payloadDiviner: string
  }
}>
