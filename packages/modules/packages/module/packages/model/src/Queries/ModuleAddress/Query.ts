import { Query } from '@xyo-network/payload-model'

export type ModuleAddressQuerySchema = 'network.xyo.query.module.address'
export const ModuleAddressQuerySchema: ModuleAddressQuerySchema = 'network.xyo.query.module.address'

export type ModuleAddressQuery = Query<{
  schema: ModuleAddressQuerySchema
}>
