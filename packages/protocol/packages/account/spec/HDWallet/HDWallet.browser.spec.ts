/**
 * @jest-environment jsdom
 */

import { HDWallet } from '../../src/HDWallet'
import { generateHDWalletTests } from './HDWallet.spec'

generateHDWalletTests('HDWallet: Browser', HDWallet)
