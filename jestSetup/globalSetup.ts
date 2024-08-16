import { config } from 'dotenv'
config()
import type { Config } from 'jest'
import type { SuperTest, Test } from 'supertest'

// Augment global scope with shared variables (must be var)
declare global {
  var req: SuperTest<Test>
}

/**
 * Jest global setup method runs before any tests are run
 * https://jestjs.io/docs/configuration#globalsetup-string
 */

const setup = async (_globalConfig: Config, _projectConfig: Config) => {}

module.exports = setup
