import type { Query } from '@xyo-network/payload-model'

export const ModuleStateQuerySchema = 'network.xyo.query.module.state' as const
export type ModuleStateQuerySchema = typeof ModuleStateQuerySchema

export type ModuleStateQuery = Query<void, ModuleStateQuerySchema>
