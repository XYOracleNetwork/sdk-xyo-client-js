import { asSchema, type Query } from '@xyo-network/payload-model'

export const ModuleAddressQuerySchema = asSchema('network.xyo.query.module.address', true)
export type ModuleAddressQuerySchema = typeof ModuleAddressQuerySchema

export type ModuleAddressQuery = Query<{
  schema: ModuleAddressQuerySchema
}>
