/* eslint-disable no-var */
import { config } from 'dotenv'
config()
import { getServer } from '@xyo-network/express-node-server'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { XyoSchemaNameValidator } from '@xyo-network/schema-name-validator'
import { Server } from 'http'
import { Config } from 'jest'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { agent, SuperAgentTest } from 'supertest'

// Augment global scope with shared variables (must be var)
declare global {
  var mongo: MongoMemoryReplSet
  var req: SuperAgentTest
  var sever: Server
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
  const port = parseInt(process.env.APP_PORT || '8080')
  const server = await getServer(port)
  globalThis.sever = server
  globalThis.req = agent(server)
  const baseURL = req.get('/').url
  process.env.baseURL = baseURL
}

/**
 * Jest global setup method runs before any tests are run
 * https://jestjs.io/docs/configuration#globalsetup-string
 */
module.exports = async (_globalConfig: Config, _projectConfig: Config) => {
  PayloadValidator.setSchemaNameValidatorFactory((schema: string) => new XyoSchemaNameValidator(schema))
  await setupMongo()
  await setupNode()
}
