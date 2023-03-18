import { AxiosJson } from '@xyo-network/axios'
import { getApp } from '@xyo-network/express-node-server'
import { HttpBridge, HttpBridgeConfigSchema, XyoHttpBridgeParams } from '@xyo-network/http-bridge'
import { Express } from 'express'
import supertest, { SuperTest, Test } from 'supertest'

/* eslint-disable no-var */
declare global {
  var app: Express
  var baseURL: string
  var bridge: HttpBridge
  var req: SuperTest<Test>
}

const setupNode = async () => {
  globalThis.app = await getApp()
  globalThis.req = supertest(app)
  globalThis.baseURL = req.get('/').url
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
