import { HttpBridge, HttpBridgeConfigSchema, XyoHttpBridgeParams } from '@xyo-network/http-bridge'

import { getRequestClient } from '../Server'

let bridge: HttpBridge

export const getBridge = async (): Promise<HttpBridge> => {
  if (bridge) return bridge
  const client = getRequestClient()
  const nodeUri = '/node'
  const schema = HttpBridgeConfigSchema
  const security = { allowAnonymous: true }
  const config = { nodeUri, schema, security }
  const params: XyoHttpBridgeParams = { axios: client, config }
  bridge = await HttpBridge.create(params)
  return bridge
}
