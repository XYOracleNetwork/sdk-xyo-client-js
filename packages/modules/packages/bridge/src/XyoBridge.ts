import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoModule } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { BridgeModule } from './Bridge'
import { XyoBridgeConfig } from './Config'
import { XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, XyoBridgeQuery } from './Queries'

export abstract class XyoBridge<TConfig extends XyoBridgeConfig = XyoBridgeConfig, TQuery extends XyoBridgeQuery = XyoBridgeQuery>
  extends XyoModule<TConfig, TQuery>
  implements BridgeModule<TQuery>
{
  override queries() {
    return [XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, ...super.queries()]
  }

  abstract connect(): Promisable<boolean>
  abstract disconnect(): Promisable<boolean>

  abstract forward(query: TQuery): Promise<[XyoBoundWitness, (XyoPayload | null)[]]>

  override async query(query: TQuery): Promise<[XyoBoundWitness, (XyoPayload | null)[]]> {
    const payloads: (XyoPayload | null)[] = []
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
          return super.query(query)
        }
    }
    return [this.bindPayloads(payloads), payloads]
  }
}
