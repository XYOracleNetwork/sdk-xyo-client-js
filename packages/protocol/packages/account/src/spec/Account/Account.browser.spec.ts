/**
 * @jest-environment jsdom
 */
import { Account } from '../../Account'
import { accountTests } from './Account.spec'

accountTests('Account: Browser', Account)
