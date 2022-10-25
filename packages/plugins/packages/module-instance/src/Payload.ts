import { XyoPayload } from '@xyo-network/payload'

import { XyoModuleInstanceSchema } from './Schema'

export interface XyoModuleInstanceQueryConfig {
  cost?: string
}

export type XyoModuleInstancePayload = XyoPayload<{
  address: string
  queries?: Record<string, XyoModuleInstanceQueryConfig>
  schema: XyoModuleInstanceSchema
}>
