import { describe } from 'vitest'

import { HDWallet } from '../../HDWallet.ts'
import { generateHDWalletTests } from './HDWallet.spec.ts'

/**
 * @group nodejs
 */
describe('Node Wallet Test', () => {
  generateHDWalletTests('HDWallet: Node', HDWallet)
})
