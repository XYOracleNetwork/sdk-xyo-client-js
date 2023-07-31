import { Account } from '@xyo-network/account'
import { Payload } from '@xyo-network/payload-model'

import { getHash, getNewBoundWitness, insertBlock, insertPayload } from '../../../testUtil'
import { createPointer, expectHashNotFoundError } from './get.payloadPointer.spec'

describe('/:hash', () => {
  describe('with rules for [address]', () => {
    const accountA = Account.randomSync()
    const accountB = Account.randomSync()
    const accountC = Account.randomSync()
    const accountD = Account.randomSync()
    const payloads: Payload[] = []
    beforeAll(async () => {
      const [bwA, payloadsA] = await getNewBoundWitness([accountA])
      const [bwB, payloadsB] = await getNewBoundWitness([accountB])
      const [bwC, payloadsC] = await getNewBoundWitness([accountC])
      const [bwD, payloadsD] = await getNewBoundWitness([accountD])
      const [bwE, payloadsE] = await getNewBoundWitness([accountC, accountD])
      const [bwF, payloadsF] = await getNewBoundWitness([accountC])
      const [bwG, payloadsG] = await getNewBoundWitness([accountD])
      payloads.push(...[...payloadsA, ...payloadsB, ...payloadsC, ...payloadsD, ...payloadsE, ...payloadsF, ...payloadsG])
      const boundWitnesses = [bwA, bwB, bwC, bwD, bwE, bwF, bwG]
      const blockResponse = await insertBlock(boundWitnesses)
      expect(blockResponse.length).toBe(boundWitnesses.length)
      const payloadResponse = await insertPayload(payloads)
      expect(payloadResponse.length).toBe(payloads.length)
    })
    describe('single address', () => {
      it.each([
        [accountA, () => payloads[0]],
        [accountB, () => payloads[1]],
      ])('returns Payload signed by address', async (account, getData) => {
        const expected = getData()
        const pointerHash = await createPointer([[account.address]], [[expected.schema]])
        const result = await getHash(pointerHash)
        expect(result).toEqual(expected)
      })
    })
    describe('multiple address rules', () => {
      describe('combined serially', () => {
        it('returns Payload signed by both addresses', async () => {
          const expected = payloads[4]
          const pointerHash = await createPointer([[accountC.address], [accountD.address]], [[expected.schema]])
          const result = await getHash(pointerHash)
          expect(result).toEqual(expected)
        })
      })
      describe('combined in parallel', () => {
        it('returns Payload signed by both address', async () => {
          const expected = payloads[4]
          const pointerHash = await createPointer([[accountC.address, accountD.address]], [[expected.schema]])
          const result = await getHash(pointerHash)
          expect(result).toEqual(expected)
        })
      })
    })
    it('no matching address', async () => {
      const pointerHash = await createPointer([[Account.randomSync().address]], [[payloads[0].schema]])
      const result = await getHash(pointerHash)
      expectHashNotFoundError(result)
    })
  })
})
