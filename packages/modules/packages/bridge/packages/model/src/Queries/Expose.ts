import { Direction, ModuleIdentifier } from '@xyo-network/module-model'
import { Payload, Query } from '@xyo-network/payload-model'

export const BridgeExposeQuerySchema = 'network.xyo.query.bridge.expose'
export type BridgeExposeQuerySchema = typeof BridgeExposeQuerySchema

export interface BridgeExposeOptions {
  direction?: Direction
  maxDepth?: number
}

export const ModuleFilterPayloadSchema = 'network.xyo.module.filter'
export type ModuleFilterPayloadSchema = typeof ModuleFilterPayloadSchema

export type ModuleFilterPayload = Payload<{ id: ModuleIdentifier } & BridgeExposeOptions, ModuleFilterPayloadSchema>

export type BridgeExposeQuery = Query<void, BridgeExposeQuerySchema>
