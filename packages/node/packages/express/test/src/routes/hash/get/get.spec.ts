import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload-model'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import {
  claimArchive,
  getArchiveName,
  getBlocksWithPayloads,
  getBlockWithPayloads,
  getHash,
  getTokenForOtherUnitTestUser,
  getTokenForUnitTestUser,
  postBlock,
  setArchiveAccessControl,
} from '../../../testUtil'

describe('/:hash', () => {
  let ownerToken = ''
  let otherUserToken = ''
  beforeAll(async () => {
    ownerToken = await getTokenForUnitTestUser()
    otherUserToken = await getTokenForOtherUnitTestUser()
  })
  describe('return format is', () => {
    let archive = ''
    const block = getBlocksWithPayloads(2, 2)
    expect(block).toBeTruthy()
    const boundWitness = block[0]
    expect(boundWitness).toBeTruthy()
    const boundWitnessHash = new PayloadWrapper(boundWitness).hash
    expect(boundWitnessHash).toBeTruthy()
    const payload = boundWitness?._payloads?.[0]
    expect(payload).toBeTruthy()
    const payloadHash = boundWitness?.payload_hashes?.[0]
    expect(payloadHash).toBeTruthy()
    beforeAll(async () => {
      archive = getArchiveName()
      await claimArchive(ownerToken, archive)
      const blockResponse = await postBlock(block, archive)
      expect(blockResponse.length).toBe(2)
    })
    it('a single bound witness', async () => {
      const response = await getHash(boundWitnessHash)
      expect(response).toBeTruthy()
      expect(Array.isArray(response)).toBe(false)
      const actual = response as XyoBoundWitness
      expect(actual.addresses).toEqual(boundWitness.addresses)
      expect(actual.payload_hashes).toEqual(boundWitness.payload_hashes)
      expect(actual.payload_schemas).toEqual(boundWitness.payload_schemas)
      expect(actual.previous_hashes).toEqual(boundWitness.previous_hashes)
    })
    it('a single payload', async () => {
      const response = await getHash(payloadHash)
      expect(response).toBeTruthy()
      expect(Array.isArray(response)).toBe(false)
      const actual = response as XyoPayload
      expect(actual.schema).toEqual(payload?.schema)
    })
  })
  describe('with public archive', () => {
    let archive = ''
    const boundWitness = getBlockWithPayloads(1)
    expect(boundWitness).toBeTruthy()
    const boundWitnessHash = boundWitness?._hash as string
    expect(boundWitnessHash).toBeTruthy()
    const payload = boundWitness._payloads?.[0]
    expect(payload).toBeTruthy()
    const payloadHash = boundWitness.payload_hashes?.[0]
    expect(payloadHash).toBeTruthy()
    beforeAll(async () => {
      archive = getArchiveName()
      await claimArchive(ownerToken, archive)
      const blockResponse = await postBlock(boundWitness, archive)
      expect(blockResponse.length).toBe(1)
    })
    describe.each([
      ['bound witness', boundWitnessHash],
      ['payload', payloadHash],
    ])('with %s hash', (hashKind, hash) => {
      it(`with anonymous user returns the ${hashKind}`, async () => {
        await getHash(hash, undefined)
      })
      it(`with non-archive owner returns the ${hashKind}`, async () => {
        await getHash(hash, otherUserToken)
      })
      it(`with archive owner returns the ${hashKind}`, async () => {
        const result = await getHash(hash, ownerToken)
        expect(result).toBeTruthy()
      })
    })
  })
  describe('with private archive', () => {
    let archive = ''
    const boundWitness = getBlockWithPayloads(1)
    expect(boundWitness).toBeTruthy()
    const boundWitnessHash = boundWitness?._hash as string
    expect(boundWitnessHash).toBeTruthy()
    const payload = boundWitness._payloads?.[0]
    expect(payload).toBeTruthy()
    const payloadHash = boundWitness.payload_hashes?.[0]
    expect(payloadHash).toBeTruthy()
    beforeAll(async () => {
      archive = getArchiveName()
      await claimArchive(ownerToken, archive)
      await setArchiveAccessControl(ownerToken, archive, { accessControl: true, archive })
      const blockResponse = await postBlock(boundWitness, archive, ownerToken)
      expect(blockResponse.length).toBe(1)
    })
    describe.each([
      ['bound witness', boundWitnessHash],
      ['payload', payloadHash],
    ])('with %s hash', (hashKind, hash) => {
      beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {
          // Stop expected errors from being logged
        })
      })
      describe(`returns ${ReasonPhrases.NOT_FOUND}`, () => {
        it('with anonymous user', async () => {
          await getHash(hash, undefined, StatusCodes.NOT_FOUND)
        })
        it('with non-archive owner', async () => {
          await getHash(hash, otherUserToken, StatusCodes.NOT_FOUND)
        })
      })
      it(`with archive owner returns the ${hashKind}`, async () => {
        const result = await getHash(hash, ownerToken)
        expect(result).toBeTruthy()
      })
    })
  })
  describe('with nonexistent hash', () => {
    beforeAll(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {
        // Stop expected errors from being logged
      })
    })
    it(`returns ${ReasonPhrases.NOT_FOUND}`, async () => {
      await getHash('non_existent_hash', undefined, StatusCodes.NOT_FOUND)
    })
  })
})
