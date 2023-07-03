/**
 * @jest-environment jsdom
 */

import { HDWallet } from '../../HDWallet'
import { generateHDWalletTests } from './HDWallet.spec'

generateHDWalletTests('HDWallet: Browser', HDWallet)
