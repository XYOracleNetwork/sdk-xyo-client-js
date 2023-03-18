import { AxiosJson } from '@xyo-network/axios'
import { HttpBridge, HttpBridgeConfigSchema, XyoHttpBridgeParams } from '@xyo-network/http-bridge'

let bridge: HttpBridge

export const getBridge = async (): Promise<HttpBridge> => {
  if (bridge) return bridge
  const baseURL = process.env.baseURL
  const axios = new AxiosJson({ baseURL })
  const nodeUri = '/node'
  const schema = HttpBridgeConfigSchema
  const security = { allowAnonymous: true }
  const config = { nodeUri, schema, security }
  const params: XyoHttpBridgeParams = { axios, config }
  bridge = await HttpBridge.create(params)
  return bridge
}
