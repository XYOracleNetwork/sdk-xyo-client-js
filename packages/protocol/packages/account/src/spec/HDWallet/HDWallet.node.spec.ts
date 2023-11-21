import { HDWallet } from '../../HDWallet'
import { generateHDWalletTests } from './HDWallet.spec'

/**
 * @group nodejs
 */

describe.skip('Node Wallet Test', () => {
  generateHDWalletTests('HDWallet: Node', HDWallet)
})
