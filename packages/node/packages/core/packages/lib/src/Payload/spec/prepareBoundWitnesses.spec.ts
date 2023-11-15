import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { uuid } from '@xyo-network/core'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { BoundWitnessMeta, BoundWitnessWithPartialMeta, PayloadMeta, PayloadWithPartialMeta } from '@xyo-network/payload-mongodb'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { prepareBoundWitnesses, PrepareBoundWitnessesResult } from '../prepareBoundWitnesses'

const _client = 'js'
const _observeDuration = 10
const _source_ip = '192.168.1.20'
const _timestamp = 1655137984429
const _user_agent = 'Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36'
const _hash = () => PayloadWrapper.wrap({ schema: 'network.xyo.test' }).hashAsync()

const boundWitnessMeta = async (): Promise<BoundWitnessMeta> => ({
  _client,
  _hash: await _hash(),
  _observeDuration,
  _source_ip,
  _timestamp,
  _user_agent,
})

const payloadMeta = async (): Promise<PayloadMeta> => ({
  _client,
  _hash: await _hash(),
  _observeDuration,
  _timestamp,
  _user_agent,
})

const getPayloads = (numPayloads: number): Payload[] => {
  return new Array(numPayloads).fill(0).map(() => new PayloadBuilder({ schema: 'network.xyo.test' }).fields({ ...payloadMeta, uid: uuid() }).build())
}

const getNewBlockWithBoundWitnessesWithPayloads = (
  numBoundWitnesses = 1,
  numPayloads = 1,
): Promise<Array<BoundWitnessWithPartialMeta & PayloadWithPartialMeta>> => {
  return Promise.all(
    new Array(numBoundWitnesses).fill(0).map(async () => {
      return (await new BoundWitnessBuilder({ inlinePayloads: true }).payloads(getPayloads(numPayloads)).build(true))[0]
    }),
  )
}

const validateBeforeSanitization = (boundWitnesses: Array<BoundWitnessWithPartialMeta & PayloadWithPartialMeta>) => {
  boundWitnesses.map((bw) => {
    expect(bw._client).toBe(_client)
    expect(bw._hash).toBeDefined()
    expect(bw._observeDuration).toBeUndefined()
    expect(bw._payloads).toBeDefined()
    expect(Array.isArray(bw._payloads)).toBeTruthy()
    expect(bw._source_ip).toBeUndefined()
    expect(bw._timestamp).toBeTruthy()
    expect(bw._user_agent).toBeUndefined()
    expect(bw.addresses).toBeDefined()
    expect(Array.isArray(bw.addresses)).toBeTruthy()
    expect(bw.payload_hashes).toBeDefined()
    expect(Array.isArray(bw.payload_hashes)).toBeTruthy()
    expect(bw.payload_schemas).toBeDefined()
    expect(Array.isArray(bw.payload_schemas)).toBeTruthy()
    expect(bw.schema).toBe(BoundWitnessSchema)
    bw?._payloads?.map((p) => {
      expect(p._client).toBeUndefined
      expect(p._hash).toBeUndefined()
      expect(p._observeDuration).toBeUndefined()
      expect(p._timestamp).toBeUndefined()
      expect(p.schema).toBeDefined()
    })
  })
}

const validateAfterSanitization = (actual: PrepareBoundWitnessesResult) => {
  actual.sanitized.map((bw) => {
    expect(bw._client).toBe(_client)
    expect(bw._hash).toBeTruthy()
    expect(bw._observeDuration).toBe(_observeDuration)
    expect(bw._payloads).toBeUndefined()
    expect(bw._source_ip).toBe(_source_ip)
    expect(bw._timestamp).toBeTruthy()
    expect(bw._user_agent).toBeTruthy()
    expect(bw.addresses).toBeDefined()
    expect(Array.isArray(bw.addresses)).toBeTruthy()
    expect(bw.payload_hashes).toBeDefined()
    expect(Array.isArray(bw.payload_hashes)).toBeTruthy()
    expect(bw.payload_schemas).toBeDefined()
    expect(Array.isArray(bw.payload_schemas)).toBeTruthy()
    expect(bw.schema).toBe(BoundWitnessSchema)
  })
  actual.payloads.map((p) => {
    expect(p._client).toBe(_client)
    expect(p._hash).toBeTruthy()
    expect(p._observeDuration).toBe(_observeDuration)
    expect(p._timestamp).toBeTruthy()
    expect(p.schema).toBeTruthy()
  })
}

describe('prepareBoundWitnesses', () => {
  describe.each([0, 1, 2])('with %d boundWitnesses', (numBoundWitnesses: number) => {
    describe.each([0, 1, 2])('with %d payloads', (numPayloadVersions: number) => {
      it('prepares the boundWitness/payloads', async () => {
        const boundWitnesses = await getNewBlockWithBoundWitnessesWithPayloads(numBoundWitnesses, numPayloadVersions)
        validateBeforeSanitization(boundWitnesses)
        const actual = await prepareBoundWitnesses(boundWitnesses, await boundWitnessMeta(), await payloadMeta())
        validateAfterSanitization(actual)
      })
    })
  })
})
