/* eslint-disable no-var */
import { config } from 'dotenv'
config()
import { HttpBridge } from '@xyo-network/http-bridge'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { XyoSchemaNameValidator } from '@xyo-network/schema-name-validator'
import { Server } from 'http'
import { Config } from 'jest'
import { MongoMemoryReplSet } from 'mongodb-memory-server'

// Augment global scope with shared variables (must be var)
declare global {
  var app: Server
  var baseURL: string
  var bridge: HttpBridge
  var mongo: MongoMemoryReplSet
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

/**
 * Jest global setup method runs before any tests are run
 * https://jestjs.io/docs/configuration#globalsetup-string
 */
module.exports = async (_globalConfig: Config, _projectConfig: Config) => {
  PayloadValidator.setSchemaNameValidatorFactory((schema) => new XyoSchemaNameValidator(schema))
  await setupMongo()
}
