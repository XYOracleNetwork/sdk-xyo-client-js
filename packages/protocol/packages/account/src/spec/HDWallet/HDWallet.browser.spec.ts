/**
 * @jest-environment jsdom
 */

import { HDWallet } from '../../HDWallet'
import { generateHDWalletTests } from './HDWallet.spec'

/**
 * @group jsdom
 */
describe('Node Wallet Test', () => {
  generateHDWalletTests('HDWallet: Browser', HDWallet)
})
