import type { Query } from '@xyo-network/payload-model'

export const ModuleAddressQuerySchema = 'network.xyo.query.module.address' as const
export type ModuleAddressQuerySchema = typeof ModuleAddressQuerySchema

export type ModuleAddressQuery = Query<{
  schema: ModuleAddressQuerySchema
}>
