import '@xylabs/vitest-extended'

import { HDWallet } from '@xyo-network/account'
import { PayloadPointerDivinerConfigSchema } from '@xyo-network/diviner-payload-pointer-model'
import type { WalletInstance } from '@xyo-network/wallet-model'
import {
  beforeAll, describe, expect, it,
} from 'vitest'

import { PayloadPointerDiviner } from '../Diviner.ts'

describe('PayloadPointerDiviner', () => {
  let account: WalletInstance
  let sut: PayloadPointerDiviner
  beforeAll(async () => {
    account = await HDWallet.random()
    sut = await PayloadPointerDiviner.create({
      account,
      config: {
        archivist: 'archivist',
        boundWitnessDiviner: 'boundWitnessDiviner',
        payloadDiviner: 'payloadDiviner',
        schema: PayloadPointerDivinerConfigSchema,
      },
    })
  })
  describe('with no input', () => {
    it('returns empty array', async () => {
      expect(await sut.divine()).toEqual([])
    })
  })
})
