/**
 * @jest-environment jsdom
 */

import { HDWallet } from '../../HDWallet'
import { generateHDWalletTests } from './HDWallet.spec'

/**
 * @group jsdom
 */

describe.skip('Browser Wallet Test', () => {
  generateHDWalletTests('HDWallet: Browser', HDWallet)
})
