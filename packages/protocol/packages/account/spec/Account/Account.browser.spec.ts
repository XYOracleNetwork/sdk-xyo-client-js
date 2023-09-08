/**
 * @jest-environment jsdom
 */
import { Account } from '../../src/Account'
import { generateAccountTests } from './Account.spec'

generateAccountTests('Account: Browser', Account)
