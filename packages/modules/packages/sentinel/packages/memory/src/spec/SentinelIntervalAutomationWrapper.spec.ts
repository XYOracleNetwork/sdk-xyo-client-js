import '@xylabs/vitest-extended'

import { SentinelIntervalAutomationSchema } from '@xyo-network/sentinel-model'
import {
  describe, expect, it,
} from 'vitest'

import { SentinelIntervalAutomationWrapper } from '../SentinelIntervalAutomationWrapper.ts'

/*
 * @group sentinel
 */
describe('SentinelIntervalAutomationWrapper', () => {
  const frequency = 1
  const frequencyUnits = 'second'
  const schema = SentinelIntervalAutomationSchema
  const type = 'interval'
  const start = 0
  describe('next', () => {
    it('when more remains', () => {
      const remaining = 2
      const input = {
        frequency, frequencyUnits, remaining, schema, start, type,
      } as const
      const sut = new SentinelIntervalAutomationWrapper(input)
      const actual = sut.next().payload
      expect(actual).toEqual({
        ...input, remaining: 1, start: expect.any(Number),
      })
    })
    it('with one remaining', () => {
      const remaining = 1
      const input = {
        frequency, frequencyUnits, remaining, schema, start, type,
      } as const
      const sut = new SentinelIntervalAutomationWrapper(input)
      const actual = sut.next().payload
      expect(actual).toEqual({
        ...input, remaining: 0, start: Number.POSITIVE_INFINITY,
      })
    })
    it('with zero remaining', () => {
      const remaining = 0
      const input = {
        frequency, frequencyUnits, remaining, schema, start, type,
      } as const
      const sut = new SentinelIntervalAutomationWrapper(input)
      const actual = sut.next().payload
      expect(actual).toEqual({
        ...input, remaining: 0, start: Number.POSITIVE_INFINITY,
      })
    })
  })
})
