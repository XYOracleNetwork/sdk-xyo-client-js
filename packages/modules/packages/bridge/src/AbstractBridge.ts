import { Account } from '@xyo-network/account'
import { AbstractModule, ModuleQueryResult, QueryBoundWitnessWrapper, XyoErrorBuilder, XyoQuery, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { BridgeModule } from './Bridge'
import { BridgeConfig } from './Config'
import { XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, XyoBridgeQuery } from './Queries'

export abstract class AbstractBridge<TConfig extends BridgeConfig = BridgeConfig> extends AbstractModule<TConfig> implements BridgeModule {
  override queries() {
    return [XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, ...super.queries()]
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoBridgeQuery>(query, payloads)
    const typedQuery = wrapper.query.payload

    const queryAccount = new Account()

    try {
      switch (typedQuery.schema) {
        case XyoBridgeConnectQuerySchema: {
          await this.connect()
          break
        }
        case XyoBridgeDisconnectQuerySchema: {
          await this.disconnect()
          break
        }
        default:
          if (super.queries().includes(typedQuery.schema)) {
            return super.query(query, payloads)
          } else {
            return this.forward(typedQuery)
          }
      }
    } catch (ex) {
      const error = ex as Error
      return this.bindResult([new XyoErrorBuilder([wrapper.hash], error.message).build()], queryAccount)
    }
    return this.bindResult([], queryAccount)
  }

  abstract connect(): Promisable<boolean>
  abstract disconnect(): Promisable<boolean>

  abstract forward(query: XyoQuery): Promise<ModuleQueryResult>
}

/** @deprecated use AbstractBridge instead */
export abstract class XyoBridge<TConfig extends BridgeConfig = BridgeConfig> extends AbstractBridge<TConfig> {}
