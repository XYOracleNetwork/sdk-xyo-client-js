import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { Payload } from '@xyo-network/payload-model'

import { getHash, getNewBoundWitness, insertBlock, insertPayload } from '../../../testUtil'
import { createPointer, expectHashNotFoundError } from './get.payloadPointer.spec'

describe('/:hash', () => {
  describe('with rules for [timestamp]', () => {
    const account = Account.randomSync()
    let payloads: Payload[]
    let expectedSchema: string
    beforeAll(async () => {
      const [bwA, payloadsA] = await getNewBoundWitness([account])
      const [bwB, payloadsB] = await getNewBoundWitness([account])
      const [bwC, payloadsC] = await getNewBoundWitness([account])
      payloads = [...payloadsA, ...payloadsB, ...payloadsC]
      const boundWitnesses = [bwA, bwB, bwC]
      expectedSchema = payloadsA[0].schema
      for (const bw of boundWitnesses) {
        const blockResponse = await insertBlock(bw, account)
        expect(blockResponse.length).toBe(1)
      }
      const payloadResponse = await insertPayload(payloads)
      expect(payloadResponse.length).toBe(payloads.length)
    })
    it('ascending', async () => {
      const expected = assertEx(payloads.at(0))
      const pointerHash = await createPointer([[account.address]], [[expectedSchema]], 0, 'asc')
      const result = await getHash(pointerHash)
      expect(result).toEqual(expected)
    })
    it('descending', async () => {
      const expected = assertEx(payloads.at(-1))
      const pointerHash = await createPointer([[account.address]], [[expectedSchema]], Date.now(), 'desc')
      const result = await getHash(pointerHash)
      expect(result).toEqual(expected)
    })
    it('no matching timestamp', async () => {
      const pointerHash = await createPointer([[account.address]], [[expectedSchema]], Date.now(), 'asc')
      const result = await getHash(pointerHash)
      expectHashNotFoundError(result)
    })
  })
})
