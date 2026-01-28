import { asSchema, type Query } from '@xyo-network/payload-model'

export const ModuleStateQuerySchema = asSchema('network.xyo.query.module.state', true)
export type ModuleStateQuerySchema = typeof ModuleStateQuerySchema

export type ModuleStateQuery = Query<void, ModuleStateQuerySchema>
