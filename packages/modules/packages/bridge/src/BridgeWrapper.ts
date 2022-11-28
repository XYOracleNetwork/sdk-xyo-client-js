import { ModuleWrapper } from '@xyo-network/module'
import { PayloadWrapper } from '@xyo-network/payload'

import { Bridge } from './Bridge'
import { XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, XyoBridgeQuery } from './Queries'

export class BridgeWrapper extends ModuleWrapper implements Bridge {
  async connect(uri?: string): Promise<boolean> {
    const queryPayload = PayloadWrapper.parse<XyoBridgeQuery>({ schema: XyoBridgeConnectQuerySchema, uri })
    const query = await this.bindQuery(queryPayload)
    await this.module.query(query[0], query[1])
    return true
  }

  async disconnect(uri?: string): Promise<boolean> {
    const queryPayload = PayloadWrapper.parse<XyoBridgeQuery>({ schema: XyoBridgeDisconnectQuerySchema, uri })
    const query = await this.bindQuery(queryPayload)
    await this.module.query(query[0], query[1])
    return true
  }
}

/** @deprecated use BridgeWrapper instead */
export class XyoBridgeWrapper extends BridgeWrapper {}
