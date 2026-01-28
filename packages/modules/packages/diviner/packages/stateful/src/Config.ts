import type { DivinerConfig } from '@xyo-network/diviner-model'
import type { ModuleIdentifier } from '@xyo-network/module-model'
import { asSchema } from '@xyo-network/payload-model'

import { StatefulDivinerSchema } from './Schema.ts'

/**
 * The schema for a Stateful Diviner config
 */
export const StatefulDivinerConfigSchema = asSchema(`${StatefulDivinerSchema}.config`, true)
/**
 * The schema for a Stateful Diviner config
 */
export type StatefulDivinerConfigSchema = typeof StatefulDivinerConfigSchema

/**
 * The config for a Stateful Diviner
 */
export type StatefulDivinerConfig = DivinerConfig<{
  schema: StatefulDivinerConfigSchema
  stateStore: {
    archivist: ModuleIdentifier
    boundWitnessDiviner: ModuleIdentifier
    payloadDiviner: ModuleIdentifier
  }
}>
