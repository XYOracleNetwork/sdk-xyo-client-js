import { XyoModuleWrapper } from '@xyo-network/module'

import { Bridge } from './Bridge'
import { XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, XyoBridgeQuery } from './Queries'

export class XyoBridgeWrapper extends XyoModuleWrapper implements Bridge {
  async connect(uri?: string): Promise<boolean> {
    const query: XyoBridgeQuery = { schema: XyoBridgeConnectQuerySchema, uri }
    const bw = (await this.bindPayloads([query]))[0]
    await this.module.query(bw, query)
    return true
  }

  async disconnect(uri?: string): Promise<boolean> {
    const query: XyoBridgeQuery = { schema: XyoBridgeDisconnectQuerySchema, uri }
    const bw = (await this.bindPayloads([query]))[0]
    await this.module.query(bw, query)
    return true
  }
}
