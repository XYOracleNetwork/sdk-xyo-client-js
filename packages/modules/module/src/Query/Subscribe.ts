import { XyoQueryPayload } from '@xyo-network/payload'

export type XyoModuleSubscribeQueryPayloadSchema = 'network.xyo.query.module.subscribe'
export const XyoModuleSubscribeQueryPayloadSchema: XyoModuleSubscribeQueryPayloadSchema = 'network.xyo.query.module.subscribe'

export interface XyoModuleSubscribeFilter {
  schema?: string[]
  address?: string[]
}

export type XyoModuleSubscribeQueryPayload = XyoQueryPayload<{
  schema: XyoModuleSubscribeQueryPayloadSchema
  address: string
  /** @field A subscribe with a null for filter is an unsubscribe */
  filter?: XyoModuleSubscribeFilter | null
  /** @field The maximum events queued per send [may increase frequency] */
  maxQueue?: number
}>
