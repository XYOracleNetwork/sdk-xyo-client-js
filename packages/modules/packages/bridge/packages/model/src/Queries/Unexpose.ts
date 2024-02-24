import { Query } from '@xyo-network/payload-model'

import { BridgeExposeOptions } from './Expose'

export const BridgeUnexposeQuerySchema = 'network.xyo.query.bridge.unexpose'
export type BridgeUnexposeQuerySchema = typeof BridgeUnexposeQuerySchema

export interface BridgeUnexposeOptions extends BridgeExposeOptions {}

export type BridgeUnexposeQuery = Query<void, BridgeUnexposeQuerySchema>
