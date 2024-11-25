/**
 * @jest-environment jsdom
 */
import { describe } from 'vitest'

import { Account } from '../../Account.ts'
import { generateAccountTests } from './Account.spec.ts'

/**
 * @group jsdom
 */

describe.skip('Browser Account Test', () => {
  generateAccountTests('Account: Browser', Account)
})
