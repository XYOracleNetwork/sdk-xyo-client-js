import { config } from 'dotenv'
config()
import { canAddMongoModules } from '@xyo-network/node-core-modules-mongo'
import { Config } from 'jest'

/**
 * Jest global teardown method runs after all tests are run
 * https://jestjs.io/docs/configuration#globalteardown-string
 */
module.exports = async (_globalConfig: Config, _projectConfig: Config) => {
  if (canAddMongoModules()) await globalThis.mongo.stop()
}
