/**
 * @jest-environment jsdom
 */
import { Account } from '../../Account.js'
import { generateAccountTests } from './Account.spec.js'

/**
 * @group jsdom
 */

describe.skip('Browser Account Test', () => {
  generateAccountTests('Account: Browser', Account)
})
