import { Account } from '@xyo-network/account'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

import { createPointer, getNewBoundWitness, insertBlock, insertPayload } from './testUtil/index.js'

describe('/:hash', () => {
  describe('return format is', () => {
    const account = Account.random()
    let bw: BoundWitness
    let payloads: Payload[]
    beforeAll(async () => {
      // Create data pointer will reference
      ;[bw, payloads] = await getNewBoundWitness([await account])
      const blockResponse = await insertBlock(bw, await account)
      expect(blockResponse.length).toBe(1)
      const payloadResponse = await insertPayload(payloads, await account)
      expect(payloadResponse.length).toBe(1)
    })
    it('a single Payload matching the pointer criteria', async () => {
      const expected = payloads[0]
      const pointerHash = await createPointer([[(await account).address]], [[expected.schema]])
      const response = await getHash(pointerHash)
      expect(response).toBeTruthy()
      expect(Array.isArray(response)).toBe(false)
      expect(response).toEqual(expected)
    })
    it('Empty array if no Payloads match the criteria', async () => {
      const result = await getHash('non_existent_hash')
    })
  })
  describe('with no rules', () => {
    it('returns error ', async () => {
      const pointerHash = await createPointer([], [])
      const result = await getHash(pointerHash)
      // expectSchemaNotSuppliedError(result)
    })
  })
})
