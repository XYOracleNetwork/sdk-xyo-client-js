/**
 * @jest-environment jsdom
 */

import { HDWallet } from '../../HDWallet'
import { generateHDWalletTests } from './HDWallet.spec'

/**
 * @group jsdom
 */
describe.skip('Node Wallet Test', () => {
  generateHDWalletTests('HDWallet: Browser', HDWallet)
})
