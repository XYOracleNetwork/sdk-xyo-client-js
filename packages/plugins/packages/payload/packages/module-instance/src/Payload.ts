import { XyoPayload } from '@xyo-network/payload'

import { AbstractModuleInstanceSchema } from './Schema'

export interface AbstractModuleInstanceQueryConfig {
  cost?: string
}

export type AbstractModuleInstancePayload = XyoPayload<{
  address: string
  queries?: Record<string, AbstractModuleInstanceQueryConfig>
  schema: AbstractModuleInstanceSchema
}>
