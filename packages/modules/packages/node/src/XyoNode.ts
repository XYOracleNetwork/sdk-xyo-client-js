import { XyoAccount } from '@xyo-network/account'
import { XyoModule, XyoModuleResolverFunc } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { NodeConfig } from './Config'
import { NodeModule } from './Node'
import { XyoNodeAttachedQuerySchema, XyoNodeAttachQuerySchema, XyoNodeAvailableQuerySchema, XyoNodeDetatchQuerySchema, XyoNodeQuery } from './Queries'
export abstract class XyoNode<
    TConfig extends NodeConfig = NodeConfig,
    TQuery extends XyoNodeQuery = XyoNodeQuery,
    TQueryResult extends XyoPayload = XyoPayload,
    TModule extends XyoModule = XyoModule,
  >
  extends XyoModule<TQuery, TQueryResult, TConfig>
  implements NodeModule<TQuery, TQueryResult>
{
  constructor(config?: TConfig, account?: XyoAccount, resolver?: XyoModuleResolverFunc) {
    super(config, account, resolver)
  }

  /** Query Functions - Start */
  abstract attach(_address: string): void
  abstract detatch(_address: string): void
  abstract resolve(_address: string): XyoModule | null

  registered(): string[] {
    throw new Error('Method not implemented.')
  }
  attached(): string[] {
    throw new Error('Method not implemented.')
  }

  availableModules(): XyoModule[] {
    throw new Error('Method not implemented.')
  }
  attachedModules(): XyoModule[] {
    throw new Error('Method not implemented.')
  }
  /** Query Functions - End */

  query(query: TQuery) {
    const queryAccount = new XyoAccount()
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
        this.registered()
        break
      }
      default:
        return super.query(query)
    }
    return this.bindPayloads(payloads, queryAccount)
  }

  register(_module: TModule): void {
    throw new Error('Method not implemented.')
  }

  abstract get(_address: string): TModule | undefined
}
