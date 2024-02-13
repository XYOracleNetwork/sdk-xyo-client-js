import { HDWallet } from '../../HDWallet'
import { generateHDWalletTests } from './HDWallet.spec'

/**
 * @group nodejs
 */
describe('Node Wallet Test', () => {
  generateHDWalletTests('HDWallet: Node', HDWallet)
})
