import { Account } from '@xyo-network/account'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'
import { BoundWitnessWithPartialMeta } from '@xyo-network/payload-mongodb'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { ReasonPhrases } from 'http-status-codes'

import { getHash, getNewBlocksWithPayloads, insertBlock, insertPayload } from '../../../testUtil'

describe('/:hash', () => {
  const account = Account.randomSync()
  describe('return format is', () => {
    let boundWitness: BoundWitnessWithPartialMeta
    let payload: Payload
    let boundWitnessHash: string
    let payloadHash: string
    beforeAll(async () => {
      const blocks = await getNewBlocksWithPayloads(2, 2)
      expect(blocks).toBeTruthy()
      boundWitness = blocks[0]
      expect(boundWitness).toBeTruthy()
      boundWitnessHash = await PayloadWrapper.hashAsync(boundWitness)
      expect(boundWitnessHash).toBeTruthy()
      payload = boundWitness?._payloads?.[0] as Payload
      expect(payload).toBeTruthy()
      payloadHash = boundWitness?.payload_hashes?.[0]
      expect(payloadHash).toBeTruthy()
      const blockResponse = await insertBlock(blocks)
      expect(blockResponse.length).toBe(blocks.length)
      const payloadResponse = await insertPayload(payload, account)
      expect(payloadResponse.length).toBe(1)
    })
    it('a single bound witness', async () => {
      const response = await getHash(boundWitnessHash)
      expect(response).toBeTruthy()
      expect(Array.isArray(response)).toBe(false)
      const actual = response as BoundWitness
      expect(actual.addresses).toEqual(boundWitness.addresses)
      expect(actual.payload_hashes).toEqual(boundWitness.payload_hashes)
      expect(actual.payload_schemas).toEqual(boundWitness.payload_schemas)
      expect(actual.previous_hashes).toEqual(boundWitness.previous_hashes)
    })
    it('a single payload', async () => {
      const response = await getHash(payloadHash)
      expect(response).toBeTruthy()
      expect(Array.isArray(response)).toBe(false)
      const actual = response as Payload
      expect(actual.schema).toEqual(payload?.schema)
    })
  })
  describe('with nonexistent hash', () => {
    beforeAll(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {
        // Stop expected errors from being logged
      })
    })
    it(`returns ${ReasonPhrases.NOT_FOUND}`, async () => {
      await getHash('non_existent_hash')
    })
  })
})
