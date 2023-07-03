/**
 * @jest-environment jsdom
 */
import { Account } from '../../Account'
import { generateAccountTests } from './Account.spec'

generateAccountTests('Account: Browser', Account)
