import { HDWallet } from '@xyo-network/account'
import { WalletInstance } from '@xyo-network/wallet-model'

import { JsonPathDiviner } from '../Diviner.js'

describe('JsonPathDiviner', () => {
  let wallet: WalletInstance
  beforeAll(async () => {
    wallet = await HDWallet.random()
  })
  it('should return the correct value', async () => {
    await Promise.reject('Not implemented')
  })
})
