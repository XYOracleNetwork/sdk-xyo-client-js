import { BoundWitnessBuilder, BoundWitnessBuilderConfig } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { ModuleError, Payload } from '@xyo-network/payload-model'

import { BoundWitnessMapResult, flatMapBoundWitness } from '../flatMapBoundWitness'

const config: BoundWitnessBuilderConfig = { inlinePayloads: true }

describe('flatMapBoundWitness', () => {
  const payload1: Payload = new PayloadBuilder({ schema: 'network.xyo.debug' }).fields({ nonce: '1' }).build()
  const payload2: Payload = new PayloadBuilder({ schema: 'network.xyo.debug' }).fields({ nonce: '2' }).build()
  describe('BoundWitness with Payloads & nested BoundWitnesses', () => {
    let inner: [BoundWitness, Payload[], ModuleError[]]
    let outer: [BoundWitness, Payload[], ModuleError[]]
    let result: BoundWitnessMapResult
    beforeAll(async () => {
      inner = await new BoundWitnessBuilder(config).payload(payload2).build()
      outer = await new BoundWitnessBuilder(config).payloads([payload1, inner[0]]).build()
      result = flatMapBoundWitness(outer[0])
    })
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
    let outer: [BoundWitness, Payload[], ModuleError[]]
    let result: BoundWitnessMapResult
    beforeAll(async () => {
      outer = await new BoundWitnessBuilder(config).payloads([payload1, payload2]).build()
      result = flatMapBoundWitness(outer[0])
    })
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
    let outer: [BoundWitness, Payload[], ModuleError[]]
    let result: BoundWitnessMapResult
    beforeAll(async () => {
      outer = await new BoundWitnessBuilder(config).build()
      result = flatMapBoundWitness(outer[0])
    })
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
