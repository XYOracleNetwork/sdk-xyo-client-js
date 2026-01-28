import type { ModuleIdentifier } from '@xyo-network/module-model'
import {
  asSchema, type Payload, type Query,
} from '@xyo-network/payload-model'

export const BridgeExposeQuerySchema = asSchema('network.xyo.query.bridge.expose', true)
export type BridgeExposeQuerySchema = typeof BridgeExposeQuerySchema

export interface BridgeExposeOptions {
  maxDepth?: number
  required?: boolean
}

export const ModuleFilterPayloadSchema = asSchema('network.xyo.module.filter', true)
export type ModuleFilterPayloadSchema = typeof ModuleFilterPayloadSchema

export type ModuleFilterPayload = Payload<{ id: ModuleIdentifier } & BridgeExposeOptions, ModuleFilterPayloadSchema>

export type BridgeExposeQuery = Query<void, BridgeExposeQuerySchema>
