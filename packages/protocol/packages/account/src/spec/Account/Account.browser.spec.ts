/**
 * @jest-environment jsdom
 */
import { Account } from '../../Account.ts'
import { generateAccountTests } from './Account.spec.ts'

/**
 * @group jsdom
 */

describe.skip('Browser Account Test', () => {
  generateAccountTests('Account: Browser', Account)
})
