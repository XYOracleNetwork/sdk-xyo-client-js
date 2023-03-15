import { config } from 'dotenv'
config()
import { PayloadValidator } from '@xyo-network/payload-validator'
import { XyoSchemaNameValidator } from '@xyo-network/schema-name-validator'
import { Config } from 'jest'
import { MongoMemoryReplSet } from 'mongodb-memory-server'

// Augment global scope with shared variables (must be var)
declare global {
  // eslint-disable-next-line no-var
  var mongo: MongoMemoryReplSet
}

/**
 * Jest global setup method runs before any tests are run
 * https://jestjs.io/docs/configuration#globalsetup-string
 */
module.exports = async (_globalConfig: Config, _projectConfig: Config) => {
  PayloadValidator.setSchemaNameValidatorFactory((schema) => new XyoSchemaNameValidator(schema))

  // https://nodkz.github.io/mongodb-memory-server/docs/guides/quick-start-guide/#replicaset
  // This will create an new instance of "MongoMemoryReplSet" and automatically start all Servers
  // To use Transactions, the "storageEngine" needs to be changed to `wiredTiger`
  const mongo = await MongoMemoryReplSet.create({ replSet: { count: 4, storageEngine: 'wiredTiger' } }) // This will create an ReplSet with 4 members and storage-engine "wiredTiger"
  globalThis.mongo = mongo
  await mongo.start()
  const uri = mongo.getUri()
  process.env.MONGO_CONNECTION_STRING = uri
  await Promise.resolve()
}
