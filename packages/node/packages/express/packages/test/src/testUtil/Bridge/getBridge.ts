import { assertEx } from '@xylabs/assert'
import { HttpBridge, HttpBridgeConfig, HttpBridgeConfigSchema, XyoHttpBridgeParams } from '@xyo-network/http-bridge'
import path from 'path'

let bridge: HttpBridge

export const getBridge = async (): Promise<HttpBridge> => {
  if (bridge) return bridge
  const nodeUrl = path.join(assertEx(process.env.API_DOMAIN, 'Missing API_DOMAIN'), '/node')
  const schema = HttpBridgeConfigSchema
  const security = { allowAnonymous: true }
  const config: HttpBridgeConfig = { nodeUrl, schema, security }
  const params: XyoHttpBridgeParams = { config }
  bridge = await HttpBridge.create(params)
  return bridge
}
