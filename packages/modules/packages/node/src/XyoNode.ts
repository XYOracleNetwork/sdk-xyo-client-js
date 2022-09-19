import { XyoAccount } from '@xyo-network/account'
import { XyoModule, XyoModuleResolverFunc } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { NodeConfig } from './Config'
import { NodeModule } from './NodeModule'
import {
  XyoNodeAttachedQuerySchema,
  XyoNodeAttachQuerySchema,
  XyoNodeDetatchQuerySchema,
  XyoNodeQuery,
  XyoNodeRegisteredQuerySchema,
} from './Queries'
export abstract class XyoNode<
    TConfig extends NodeConfig = NodeConfig,
    TQuery extends XyoNodeQuery = XyoNodeQuery,
    TQueryResult extends XyoPayload = XyoPayload,
    TModule extends XyoModule = XyoModule,
  >
  extends XyoModule<TQuery, TQueryResult, TConfig>
  implements NodeModule<TQuery, TQueryResult, TModule>
{
  constructor(config?: TConfig, account?: XyoAccount, resolver?: XyoModuleResolverFunc) {
    super(config, account, resolver)
  }

  /** Query Functions - Start */
  abstract attach(_address: string): void
  abstract detatch(_address: string): void
  abstract resolve(_address: string): TModule | null

  registered(): string[] {
    throw new Error('Method not implemented.')
  }
  attached(): string[] {
    throw new Error('Method not implemented.')
  }

  registeredModules(): TModule[] {
    throw new Error('Method not implemented.')
  }
  attachedModules(): TModule[] {
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
      case XyoNodeRegisteredQuerySchema: {
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
}
