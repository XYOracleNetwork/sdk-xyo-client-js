import { asSchema, type Query } from '@xyo-network/payload-model'

import type { BridgeExposeOptions } from './Expose.ts'

export const BridgeUnexposeQuerySchema = asSchema('network.xyo.query.bridge.unexpose', true)
export type BridgeUnexposeQuerySchema = typeof BridgeUnexposeQuerySchema

export interface BridgeUnexposeOptions extends BridgeExposeOptions {}

export type BridgeUnexposeQuery = Query<void, BridgeUnexposeQuerySchema>
