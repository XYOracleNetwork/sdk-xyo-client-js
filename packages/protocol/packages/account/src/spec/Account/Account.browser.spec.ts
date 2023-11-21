/**
 * @jest-environment jsdom
 */
import { Account } from '../../Account'
import { generateAccountTests } from './Account.spec'

/**
 * @group jsdom
 */

describe.skip('Browser Account Test', () => {
  generateAccountTests('Account: Browser', Account)
})
