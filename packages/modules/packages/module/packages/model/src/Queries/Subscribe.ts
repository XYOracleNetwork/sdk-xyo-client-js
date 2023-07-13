import { Query } from '@xyo-network/payload-model'

export type ModuleSubscribeQuerySchema = 'network.xyo.query.module.subscribe'
export const ModuleSubscribeQuerySchema: ModuleSubscribeQuerySchema = 'network.xyo.query.module.subscribe'

export interface ModuleSubscribeFilter {
  /** @field if specified, at least one of the schemas must be present in the boundwtness to generate a notification */
  schema?: string[]
}

//requests notification when a boundwitness is added to the modules chain that meets the filter criteria
export type ModuleSubscribeQuery = Query<{
  /** @field The address that will receive notifications */
  address: string
  /** @field A subscribe with a null for filter is an unsubscribe */
  filter?: ModuleSubscribeFilter | null
  /** @field The maximum events queued per send [may increase frequency] */
  maxQueue?: number
  schema: ModuleSubscribeQuerySchema
}>
