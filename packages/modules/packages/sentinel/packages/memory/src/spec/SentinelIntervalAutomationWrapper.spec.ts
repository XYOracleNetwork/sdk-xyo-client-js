import { SentinelIntervalAutomationSchema } from '@xyo-network/sentinel-model'

import { SentinelIntervalAutomationWrapper } from '../SentinelIntervalAutomationWrapper'

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
      const input = { frequency, frequencyUnits, remaining, schema, start, type } as const
      const sut = new SentinelIntervalAutomationWrapper(input)
      const actual = sut.next().jsonPayload()
      expect(actual).toEqual({ ...input, remaining: 1, start: expect.any(Number) })
    })
    it('with one remaining', () => {
      const remaining = 1
      const input = { frequency, frequencyUnits, remaining, schema, start, type } as const
      const sut = new SentinelIntervalAutomationWrapper(input)
      const actual = sut.next().jsonPayload()
      expect(actual).toEqual({ ...input, remaining: 0, start: Number.POSITIVE_INFINITY })
    })
    it('with zero remaining', () => {
      const remaining = 0
      const input = { frequency, frequencyUnits, remaining, schema, start, type } as const
      const sut = new SentinelIntervalAutomationWrapper(input)
      const actual = sut.next().jsonPayload()
      expect(actual).toEqual({ ...input, remaining: 0, start: Number.POSITIVE_INFINITY })
    })
  })
})
