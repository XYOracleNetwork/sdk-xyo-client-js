import { XyoModule, XyoModuleConfig, XyoModuleQueryResult } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { NodeModule } from './Node'
import { XyoNodeAttachedQuerySchema, XyoNodeAttachQuerySchema, XyoNodeAvailableQuerySchema, XyoNodeDetatchQuerySchema, XyoNodeQuery } from './Queries'

export abstract class XyoNode<
    TConfig extends XyoModuleConfig = XyoModuleConfig,
    TQuery extends XyoNodeQuery = XyoNodeQuery,
    TQueryResult extends XyoPayload = XyoPayload,
    TModule extends XyoModule = XyoModule,
  >
  extends XyoModule<TConfig, TQuery, TQueryResult>
  implements NodeModule<TQuery, TQueryResult>
{
  /** Query Functions - Start */
  abstract attach(_address: string): void
  abstract detatch(_address: string): void

  available(): string[] {
    throw new Error('Method not implemented.')
  }
  attached(): string[] {
    throw new Error('Method not implemented.')
  }
  /** Query Functions - End */

  query(query: TQuery): Promisable<XyoModuleQueryResult<TQueryResult>> {
    const payloads: (TQueryResult | null)[] = []
    switch (query.schema) {
      case XyoNodeAttachQuerySchema: {
        this.attach(query.address)
        break
      }
      case XyoNodeDetatchQuerySchema: {
        this.detatch(query.address)
        break
      }
      case XyoNodeAttachedQuerySchema: {
        this.attached()
        break
      }
      case XyoNodeAvailableQuerySchema: {
        this.available()
        break
      }
    }
    return [this.bindPayloads(payloads), payloads]
  }

  register(_module: TModule): void {
    throw new Error('Method not implemented.')
  }

  abstract get(_address: string): TModule | undefined
}
