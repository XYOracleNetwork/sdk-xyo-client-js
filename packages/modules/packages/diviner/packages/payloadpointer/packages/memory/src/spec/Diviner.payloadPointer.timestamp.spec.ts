import { assertEx } from '@xylabs/assert'
import { Account, AccountInstance } from '@xyo-network/account'
import { Payload } from '@xyo-network/payload-model'

import { createPointer, expectHashNotFoundError } from './Diviner.payloadPointer.spec.js'
import { getNewBoundWitness, insertBlock, insertPayload } from './testUtil/index.js'

describe('/:hash', () => {
  describe('with rules for [timestamp]', () => {
    let account: AccountInstance
    let payloads: Payload[]
    let expectedSchema: string
    beforeAll(async () => {
      account = await Account.random()
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
