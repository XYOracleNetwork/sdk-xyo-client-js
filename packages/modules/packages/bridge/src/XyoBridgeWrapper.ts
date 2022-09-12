import { XyoModuleWrapper } from '@xyo-network/module'

import { Bridge } from './Bridge'
import { XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, XyoBridgeQuery } from './Queries'

export class XyoBridgeWrapper extends XyoModuleWrapper implements Bridge {
  async connect(uri?: string): Promise<boolean> {
    const query: XyoBridgeQuery = { schema: XyoBridgeConnectQuerySchema, uri }
    await this.module.query(query)
    return true
  }

  async disconnect(uri?: string): Promise<boolean> {
    const query: XyoBridgeQuery = { schema: XyoBridgeDisconnectQuerySchema, uri }
    await this.module.query(query)
    return true
  }
}
