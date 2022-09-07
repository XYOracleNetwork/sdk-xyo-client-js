import { XyoQuery } from '../Query'

export type XyoModuleSubscribeQuerySchema = 'network.xyo.query.module.subscribe'
export const XyoModuleSubscribeQuerySchema: XyoModuleSubscribeQuerySchema = 'network.xyo.query.module.subscribe'

export interface XyoModuleSubscribeFilter {
  /** @field if specified, at least one of the schemas must be present in the boundwtness to generate a notification */
  schema?: string[]
}

//requests notification when a boundwitness is added to the modules chain that meets the filter criteria
export type XyoModuleSubscribeQuery = XyoQuery<{
  schema: XyoModuleSubscribeQuerySchema
  /** @field The address that will receive notifications */
  address: string
  /** @field A subscribe with a null for filter is an unsubscribe */
  filter?: XyoModuleSubscribeFilter | null
  /** @field The maximum events queued per send [may increase frequency] */
  maxQueue?: number
}>
