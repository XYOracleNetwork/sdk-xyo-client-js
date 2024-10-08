import type { DivinerConfig } from '@xyo-network/diviner-model'
import type { ModuleIdentifier } from '@xyo-network/module-model'

import { StatefulDivinerSchema } from './Schema.ts'

/**
 * The schema for a Stateful Diviner config
 */
export const StatefulDivinerConfigSchema = `${StatefulDivinerSchema}.config` as const
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
