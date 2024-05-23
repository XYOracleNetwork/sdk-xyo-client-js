import { ModuleIdentifier } from '@xyo-network/module-model'
import { Payload, Query } from '@xyo-network/payload-model'

export const BridgeExposeQuerySchema = 'network.xyo.query.bridge.expose' as const
export type BridgeExposeQuerySchema = typeof BridgeExposeQuerySchema

export interface BridgeExposeOptions {
  maxDepth?: number
  required?: boolean
}

export const ModuleFilterPayloadSchema = 'network.xyo.module.filter'
export type ModuleFilterPayloadSchema = typeof ModuleFilterPayloadSchema

export type ModuleFilterPayload = Payload<{ id: ModuleIdentifier } & BridgeExposeOptions, ModuleFilterPayloadSchema>

export type BridgeExposeQuery = Query<void, BridgeExposeQuerySchema>
