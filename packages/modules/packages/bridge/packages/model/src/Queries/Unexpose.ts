import type { Query } from '@xyo-network/payload-model'

import type { BridgeExposeOptions } from './Expose.ts'

export const BridgeUnexposeQuerySchema = 'network.xyo.query.bridge.unexpose' as const
export type BridgeUnexposeQuerySchema = typeof BridgeUnexposeQuerySchema

export interface BridgeUnexposeOptions extends BridgeExposeOptions {}

export type BridgeUnexposeQuery = Query<void, BridgeUnexposeQuerySchema>
