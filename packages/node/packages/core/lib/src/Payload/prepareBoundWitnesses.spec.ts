import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { XyoBoundWitnessMeta, XyoBoundWitnessWithPartialMeta, XyoPayloadWithPartialMeta } from '@xyo-network/node-core-model'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { v4 } from 'uuid'

import { prepareBoundWitnesses, PrepareBoundWitnessesResult } from './prepareBoundWitnesses'

const _archive = 'temp'
const _client = 'js'
const _observeDuration = 10
const _source_ip = '192.168.1.20'
const _timestamp = 1655137984429
const _user_agent = 'Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36'
const _hash = new PayloadWrapper({ schema: 'network.xyo.test' }).hash

const boundWitnessMeta: XyoBoundWitnessMeta = {
  _archive,
  _client,
  _hash,
  _observeDuration,
  _source_ip,
  _timestamp,
  _user_agent,
}
const payloadMeta = {
  _archive,
  _client,
  _hash,
  _observeDuration,
  _source_ip,
  _timestamp,
  _user_agent,
}

const getPayloads = (numPayloads: number): XyoPayload[] => {
  return new Array(numPayloads).fill(0).map(() => new XyoPayloadBuilder({ schema: 'network.xyo.test' }).fields({ ...payloadMeta, uid: v4() }).build())
}

const getNewBlockWithBoundWitnessesWithPayloads = (
  numBoundWitnesses = 1,
  numPayloads = 1,
): Array<XyoBoundWitnessWithPartialMeta & XyoPayloadWithPartialMeta> => {
  return new Array(numBoundWitnesses).fill(0).map(() => {
    return new BoundWitnessBuilder({ inlinePayloads: true }).payloads(getPayloads(numPayloads)).build()[0]
  })
}

const validateBeforeSanitization = (boundWitnesses: Array<XyoBoundWitnessWithPartialMeta & XyoPayloadWithPartialMeta>) => {
  boundWitnesses.map((bw) => {
    expect(bw._archive).toBeUndefined()
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
    expect(bw.schema).toBe(XyoBoundWitnessSchema)
    bw?._payloads?.map((p) => {
      expect(p._archive).toBeUndefined()
      expect(p._client).toBe(_client)
      expect(p._hash).toBeDefined()
      expect(p._observeDuration).toBeUndefined()
      expect(p._timestamp).toBeDefined()
      expect(p.schema).toBeDefined()
    })
  })
}

const validateAfterSanitization = (actual: PrepareBoundWitnessesResult) => {
  actual.sanitized.map((bw) => {
    expect(bw._archive).toBe(_archive)
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
    expect(bw.schema).toBe(XyoBoundWitnessSchema)
  })
  actual.payloads.map((p) => {
    expect(p._archive).toBe(_archive)
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
      it('prepares the boundWitness/payloads', () => {
        const boundWitnesses = getNewBlockWithBoundWitnessesWithPayloads(numBoundWitnesses, numPayloadVersions)
        validateBeforeSanitization(boundWitnesses)
        const actual = prepareBoundWitnesses(boundWitnesses, boundWitnessMeta, payloadMeta)
        validateAfterSanitization(actual)
      })
    })
  })
})
