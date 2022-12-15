import { ModuleWrapper } from '@xyo-network/module'
import { PayloadWrapper } from '@xyo-network/payload'

import { Bridge } from './Bridge'
import { XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, XyoBridgeQuery } from './Queries'

export class BridgeWrapper extends ModuleWrapper implements Bridge {
  async connect(uri?: string): Promise<boolean> {
    const queryPayload = PayloadWrapper.parse<XyoBridgeQuery>({ schema: XyoBridgeConnectQuerySchema, uri })
    await this.sendQuery(queryPayload)
    return true
  }

  async disconnect(uri?: string): Promise<boolean> {
    const queryPayload = PayloadWrapper.parse<XyoBridgeQuery>({ schema: XyoBridgeDisconnectQuerySchema, uri })
    await this.sendQuery(queryPayload)
    return true
  }
}
