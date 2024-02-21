import { Query } from '@xyo-network/payload-model'

export const ModuleStateQuerySchema = 'network.xyo.query.module.state'
export type ModuleStateQuerySchema = typeof ModuleStateQuerySchema

export type ModuleStateQuery = Query<void, ModuleStateQuerySchema>
