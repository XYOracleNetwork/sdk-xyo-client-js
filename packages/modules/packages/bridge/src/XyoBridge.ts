import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { QueryBoundWitnessWrapper, XyoModule, XyoQuery, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { BridgeModule } from './Bridge'
import { XyoBridgeConfig } from './Config'
import { XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, XyoBridgeQuery } from './Queries'

export abstract class XyoBridge<TConfig extends XyoBridgeConfig = XyoBridgeConfig> extends XyoModule<TConfig> implements BridgeModule {
  override queries() {
    return [XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, ...super.queries()]
  }

  abstract connect(): Promisable<boolean>
  abstract disconnect(): Promisable<boolean>

  abstract forward(query: XyoQuery): Promise<[XyoBoundWitness, (XyoPayload | null)[]]>

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T) {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoBridgeQuery>(query)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(typedQuery.schema, wrapper.addresses))

    const payloads: (XyoPayload | null)[] = []
    const queryAccount = new XyoAccount()

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
          return super.query(query)
        } else {
          return this.forward(typedQuery)
        }
    }
    return this.bindResult(payloads, queryAccount)
  }
}
