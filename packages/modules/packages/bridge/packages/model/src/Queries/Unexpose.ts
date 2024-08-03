import { Query } from '@xyo-network/payload-model'

import { BridgeExposeOptions } from './Expose.ts'

export const BridgeUnexposeQuerySchema = 'network.xyo.query.bridge.unexpose' as const
export type BridgeUnexposeQuerySchema = typeof BridgeUnexposeQuerySchema

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BridgeUnexposeOptions extends BridgeExposeOptions {}

export type BridgeUnexposeQuery = Query<void, BridgeUnexposeQuerySchema>
