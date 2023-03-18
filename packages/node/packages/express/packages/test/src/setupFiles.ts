import { AxiosJson } from '@xyo-network/axios'
import { server } from '@xyo-network/express-node-server'
import { HttpBridge, HttpBridgeConfigSchema, XyoHttpBridgeParams } from '@xyo-network/http-bridge'

const setupNode = async () => {
  const port = parseInt(process.env.APP_PORT || '8080')
  globalThis.app = await server(port)
  globalThis.baseURL = `http://localhost:${port}`
}

const setupBridge = async () => {
  const axios = new AxiosJson({ baseURL })
  const nodeUri = '/node'
  const schema = HttpBridgeConfigSchema
  const security = { allowAnonymous: true }
  const config = { nodeUri, schema, security }
  const params: XyoHttpBridgeParams = { axios, config }
  const bridge = await HttpBridge.create(params)
  globalThis.bridge = bridge
}

let setup = false

beforeAll(async () => {
  if (setup) return
  setup = true
  await setupNode()
  await setupBridge()
})

afterAll(async () => {
  await Promise.resolve()
})
