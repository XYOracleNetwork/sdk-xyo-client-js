/* eslint-disable no-var */
import { config } from 'dotenv'
config()
import { Config } from 'jest'
import { SuperTest, Test } from 'supertest'

// Augment global scope with shared variables (must be var)
declare global {
  var req: SuperTest<Test>
}

/**
 * Jest global setup method runs before any tests are run
 * https://jestjs.io/docs/configuration#globalsetup-string
 */
module.exports = async (_globalConfig: Config, _projectConfig: Config) => {}
