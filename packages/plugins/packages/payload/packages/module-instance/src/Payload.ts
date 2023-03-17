import { Payload } from '@xyo-network/payload-model'

import { AbstractModuleInstanceSchema } from './Schema'

export interface AbstractModuleInstanceQueryConfig {
  cost?: string
}

export type AbstractModuleInstancePayload = Payload<{
  address: string
  queries?: Record<string, AbstractModuleInstanceQueryConfig>
  schema: AbstractModuleInstanceSchema
}>
