/* eslint-disable no-var */
import { config } from 'dotenv'
config()
import { AxiosJson } from '@xyo-network/axios'
import { getApp } from '@xyo-network/express-node-server'
import { HttpBridge, HttpBridgeConfigSchema, XyoHttpBridgeParams } from '@xyo-network/http-bridge'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { XyoSchemaNameValidator } from '@xyo-network/schema-name-validator'
import { Express } from 'express'
import { Server } from 'http'
import { Config } from 'jest'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import supertest, { SuperTest, Test } from 'supertest'

// Augment global scope with shared variables (must be var)
declare global {
  var app: Express
  var baseURL: string
  var bridge: HttpBridge
  var mongo: MongoMemoryReplSet
  var req: SuperTest<Test>
}

const database = process.env.MONGO_DATABASE || 'archivist'

const setupMongo = async () => {
  // https://nodkz.async github.io/mongodb-memory-server/docs/guides/quick-start-guide/#replicaset
  // This will create an new instance of "MongoMemoryReplSet" and automatically start all Servers
  // To use Transactions, the "storageEngine" needs to be changed to `wiredTiger`
  const mongo = await MongoMemoryReplSet.create({
    instanceOpts: [],
    replSet: { count: 3, storageEngine: 'wiredTiger' },
  }) // This will create an ReplSet with 4 members and storage-engine "wiredTiger"
  globalThis.mongo = mongo
  const uri = mongo.getUri()
  const mongoConnectionString = uri.split('/').slice(0, -1).concat(database).join('/') + uri.split('/').slice(-1)
  // Recreate connection string to ReplicaSet adding default DB in the proper place
  process.env.MONGO_CONNECTION_STRING = mongoConnectionString
}

const setupNode = async () => {
  // const port = parseInt(process.env.APP_PORT || '8080')
  // globalThis.app = await server(port)
  // globalThis.baseURL = `http://localhost:${port}`
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

/**
 * Jest global setup method runs before any tests are run
 * https://jestjs.io/docs/configuration#globalsetup-string
 */
module.exports = async (_globalConfig: Config, _projectConfig: Config) => {
  PayloadValidator.setSchemaNameValidatorFactory((schema) => new XyoSchemaNameValidator(schema))
  await setupMongo()
  await setupNode()
  await setupBridge()
}
