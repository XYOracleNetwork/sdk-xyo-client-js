import { XyoModuleWrapper } from '@xyo-network/module'
import compact from 'lodash/compact'

import { Node } from './Node'
import {
  XyoNodeAttachedQuery,
  XyoNodeAttachedQuerySchema,
  XyoNodeAttachQuery,
  XyoNodeAttachQuerySchema,
  XyoNodeAvailableQuery,
  XyoNodeAvailableQuerySchema,
  XyoNodeDetatchQuery,
  XyoNodeDetatchQuerySchema,
} from './Queries'

export class XyoNodeWrapper extends XyoModuleWrapper implements Node {
  async available(): Promise<string[]> {
    const query: XyoNodeAvailableQuery = { schema: XyoNodeAvailableQuerySchema }
    return compact((await this.module.query(query))[1].map((payload) => payload?.schema))
  }
  async attached(): Promise<string[]> {
    const query: XyoNodeAttachedQuery = { schema: XyoNodeAttachedQuerySchema }
    return compact((await this.module.query(query))[1].map((payload) => payload?.schema))
  }
  async attach(address: string): Promise<void> {
    const query: XyoNodeAttachQuery = { address, schema: XyoNodeAttachQuerySchema }
    await this.module.query(query)
    return
  }
  async detatch(address: string): Promise<void> {
    const query: XyoNodeDetatchQuery = { address, schema: XyoNodeDetatchQuerySchema }
    await this.module.query(query)
    return
  }
}
