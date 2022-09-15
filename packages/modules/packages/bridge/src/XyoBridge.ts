import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoModule } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { BridgeModule } from './Bridge'
import { XyoBridgeConfig } from './Config'
import { XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, XyoBridgeQuery } from './Queries'

export abstract class XyoBridge<TConfig extends XyoBridgeConfig = XyoBridgeConfig, TQuery extends XyoBridgeQuery = XyoBridgeQuery>
  extends XyoModule<TQuery, XyoPayload, TConfig>
  implements BridgeModule<TQuery>
{
  override queries() {
    return [XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, ...super.queries()]
  }

  abstract connect(): Promisable<boolean>
  abstract disconnect(): Promisable<boolean>

  abstract forward(query: TQuery): Promise<[XyoBoundWitness, (XyoPayload | null)[]]>

  override async query(query: TQuery) {
    const payloads: (XyoPayload | null)[] = []
    const queryAccount = new XyoAccount()
    switch (query.schema) {
      case XyoBridgeConnectQuerySchema: {
        await this.connect()
        break
      }
      case XyoBridgeDisconnectQuerySchema: {
        await this.disconnect()
        break
      }
      default:
        if (super.queries().find((schema) => schema === query.schema)) {
          return super.query(query)
        } else {
          return this.forward(query)
        }
    }
    return this.bindPayloads(payloads, queryAccount)
  }
}
