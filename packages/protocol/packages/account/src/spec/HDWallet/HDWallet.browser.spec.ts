/**
 * @jest-environment jsdom
 */

import { HDWallet } from '../../HDWallet'
import { testHDAccount } from './HDWallet.spec'

testHDAccount('HDWallet: Browser', HDWallet)
