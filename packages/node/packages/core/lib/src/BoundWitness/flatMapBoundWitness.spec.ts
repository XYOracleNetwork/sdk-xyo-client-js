import { BoundWitnessBuilder, BoundWitnessBuilderConfig } from '@xyo-network/boundwitness'
import { DebugPayload, DebugSchema } from '@xyo-network/node-core-model'
import { XyoPayloadBuilder } from '@xyo-network/payload'
import { XyoPayload } from '@xyo-network/payload-model'

import { flatMapBoundWitness } from './flatMapBoundWitness'

const config: BoundWitnessBuilderConfig = { inlinePayloads: true }

describe('flatMapBoundWitness', () => {
  describe('BoundWitness with Payloads & nested BoundWitnesses', () => {
    const payload1: XyoPayload = new XyoPayloadBuilder<DebugPayload>({ schema: DebugSchema }).fields({ nonce: '1' }).build()
    const payload2: XyoPayload = new XyoPayloadBuilder<DebugPayload>({ schema: DebugSchema }).fields({ nonce: '2' }).build()
    const inner = new BoundWitnessBuilder(config).payload(payload2).build()
    const outer = new BoundWitnessBuilder(config).payloads([payload1, inner[0]]).build()
    const result = flatMapBoundWitness(outer[0])
    it('extracts the BoundWitnesses', () => {
      expect(result).toBeArray()
      expect(result[0]).toBeArray()
      expect(result[0].length).toBe(2)
      expect(result[0]).toContainValues([outer[0], inner[0]])
    })
    it('extracts the Payloads', () => {
      expect(result[1]).toBeArray()
      expect(result[1].length).toBe(2)
      expect(result[1]).toContainValues([payload1, payload2])
    })
  })
  describe('BoundWitness with Payloads', () => {
    const payload1: XyoPayload = new XyoPayloadBuilder<DebugPayload>({ schema: DebugSchema }).fields({ nonce: '1' }).build()
    const payload2: XyoPayload = new XyoPayloadBuilder<DebugPayload>({ schema: DebugSchema }).fields({ nonce: '2' }).build()
    const outer = new BoundWitnessBuilder(config).payloads([payload1, payload2]).build()
    const result = flatMapBoundWitness(outer[0])
    it('extracts the BoundWitnesses', () => {
      expect(result).toBeArray()
      expect(result[0]).toBeArray()
      expect(result[0].length).toBe(1)
      expect(result[0]).toContainValues([outer[0]])
    })
    it('extracts the Payloads', () => {
      expect(result[1]).toBeArray()
      expect(result[1].length).toBe(2)
      expect(result[1]).toContainValues([payload1, payload2])
    })
  })
  describe('BoundWitness without Payloads', () => {
    const outer = new BoundWitnessBuilder(config).build()
    const result = flatMapBoundWitness(outer[0])
    it('extracts the BoundWitnesses', () => {
      expect(result).toBeArray()
      expect(result[0]).toBeArray()
      expect(result[0].length).toBe(1)
      expect(result[0]).toContainValues([outer[0]])
    })
    it('extracts the Payloads', () => {
      expect(result[1]).toBeArray()
      expect(result[1].length).toBe(0)
    })
  })
})
