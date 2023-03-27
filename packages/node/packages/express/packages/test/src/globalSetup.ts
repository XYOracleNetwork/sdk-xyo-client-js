/* eslint-disable no-var */
import { config } from 'dotenv'
config()
import { getApp } from '@xyo-network/express-node-server'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { XyoSchemaNameValidator } from '@xyo-network/schema-name-validator'
import { Express } from 'express'
import { Config } from 'jest'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import supertest, { SuperTest, Test } from 'supertest'

// Augment global scope with shared variables (must be var)
declare global {
  var app: Express
  var mongo: MongoMemoryReplSet
  var req: SuperTest<Test>
}

const database = process.env.MONGO_DATABASE || 'archivist'

const setupMongo = async () => {
  console.log('Mongo: Starting')
  // https://nodkz.async github.io/mongodb-memory-server/docs/guides/quick-start-guide/#replicaset
  // This will create an new instance of "MongoMemoryReplSet" and automatically start all Servers
  // To use Transactions, the "storageEngine" needs to be changed to `wiredTiger`
  const mongo = await MongoMemoryReplSet.create({
    instanceOpts: [
      { port: 55391, replicaMemberConfig: { buildIndexes: true } },
      { port: 55392, replicaMemberConfig: { buildIndexes: true } },
      { port: 55393, replicaMemberConfig: { buildIndexes: true } },
    ],
    replSet: { count: 3, storageEngine: 'wiredTiger' },
  }) // This will create an ReplSet with 3 members and storage-engine "wiredTiger"
  await mongo.waitUntilRunning()
  globalThis.mongo = mongo
  const uri = mongo.getUri()
  const mongoConnectionString = uri.split('/').slice(0, -1).concat(database).join('/') + uri.split('/').slice(-1)
  // Recreate connection string to ReplicaSet adding default DB in the proper place
  process.env.MONGO_CONNECTION_STRING = mongoConnectionString
  console.log('Mongo: Started')
}

const setupNode = async () => {
  console.log('Node: Starting')
  globalThis.app = await getApp()
  globalThis.req = supertest(app)
  process.env.API_DOMAIN = req.get('/').url.replace(/\/$/, '')
  console.log('Node: Started')
}

/**
 * Jest global setup method runs before any tests are run
 * https://jestjs.io/docs/configuration#globalsetup-string
 */
module.exports = async (_globalConfig: Config, _projectConfig: Config) => {
  console.log('')
  PayloadValidator.setSchemaNameValidatorFactory((schema: string) => new XyoSchemaNameValidator(schema))
  await setupMongo()
  await setupNode()
}
