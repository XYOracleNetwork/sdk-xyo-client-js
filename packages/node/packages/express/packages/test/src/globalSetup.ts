import { config } from 'dotenv'
config()
import { PayloadValidator } from '@xyo-network/payload-validator'
import { XyoSchemaNameValidator } from '@xyo-network/schema-name-validator'
import { Config } from 'jest'

/**
 * Jest global setup method run before
 * any tests are run
 * https://jestjs.io/docs/configuration#globalsetup-string
 */
module.exports = async (_globalConfig: Config, _projectConfig: Config) => {
  PayloadValidator.setSchemaNameValidatorFactory((schema) => new XyoSchemaNameValidator(schema))
  await Promise.resolve()
}
