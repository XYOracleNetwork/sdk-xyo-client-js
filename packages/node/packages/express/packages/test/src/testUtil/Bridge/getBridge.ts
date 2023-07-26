import { assertEx } from '@xylabs/assert'
import { HDWallet } from '@xyo-network/account'
import { BridgeInstance } from '@xyo-network/bridge-model'
import { HttpBridge, HttpBridgeConfig, HttpBridgeConfigSchema, HttpBridgeParams } from '@xyo-network/http-bridge'
import path from 'path'

let bridge: HttpBridge

export const getBridge = async (): Promise<BridgeInstance> => {
  if (bridge) return bridge
  const nodeUrl = path.join(assertEx(process.env.API_DOMAIN, 'Missing API_DOMAIN'), '/node')
  const schema = HttpBridgeConfigSchema
  const security = { allowAnonymous: true }
  const config: HttpBridgeConfig = { nodeUrl, schema, security }
  const params: HttpBridgeParams = { account: await HDWallet.random(), config }
  bridge = await HttpBridge.create(params)
  return bridge
}
