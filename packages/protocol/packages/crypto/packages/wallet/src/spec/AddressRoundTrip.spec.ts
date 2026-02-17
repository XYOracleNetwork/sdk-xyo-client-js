import { Account } from '@xyo-network/account'
import {
  describe, expect, it,
} from 'vitest'

import { HDWallet } from '../HDWallet.ts'

describe('Address', () => {
  it('should round trip from BigInt', async () => {
    for (let index = 0; index < 100; index++) {
      const foo = await HDWallet.random()
      const privateKey = BigInt(foo.privateKey)
      const sharedAccount = await Account.fromPrivateKey(privateKey)
      expect(sharedAccount).toBeDefined()
    }
  })
})
