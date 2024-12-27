import { describe } from 'vitest'

import { Account } from '../../Account.ts'
import { generateAccountTests } from './Account.spec.ts'

describe('Node Account Test', () => {
  generateAccountTests('Account: Node', Account)
})
