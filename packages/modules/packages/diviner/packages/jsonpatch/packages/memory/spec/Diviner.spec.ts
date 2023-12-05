import { Account, HDWallet } from '@xyo-network/account'
import { JsonPatchDivinerConfigSchema } from '@xyo-network/diviner-jsonpatch-model'

import { JsonPatchDiviner } from '../src'

const cases = [[]]

/**
 * @group module
 * @group diviner
 */

describe('MemoryJsonPatchDiviner', () => {
  let sut: JsonPatchDiviner
  let wallet: HDWallet
  beforeAll(async () => {
    wallet = await HDWallet.random()
  })
  describe('divine', () => {
    describe('with single input', () => {
      it.each(cases)('should jsonpatch the input according to the jsonpatch', async (config, input, expected) => {
        const sut = await JsonPatchDiviner.create({ config, wallet })
        const result = await sut.divine([input])
        expect(result).toBeArrayOfSize(1)
        expect(result[0]).toEqual(expected)
      })
    })
  })
})
