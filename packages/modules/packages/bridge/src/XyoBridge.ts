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
  override get queries() {
    return [XyoBridgeConnectQuerySchema]
  }

  abstract connect(uri?: string): Promisable<boolean>
  abstract disconnect(uri?: string): Promisable<boolean>

  override async query(query: TQuery): Promise<[XyoBoundWitness, (XyoPayload | null)[]]> {
    const payloads: (XyoPayload | null)[] = []
    switch (query.schema) {
      case XyoBridgeConnectQuerySchema: {
        await this.connect(query?.uri)
        break
      }
      case XyoBridgeDisconnectQuerySchema: {
        await this.disconnect(query?.uri)
        break
      }
      default:
        return super.query(query)
    }
    return [this.bindPayloads(payloads), payloads]
  }
}
