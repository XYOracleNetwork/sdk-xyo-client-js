import type { PayloadAddressRule, PayloadRule, PayloadSchemaRule, PayloadTimestampOrderRule } from '@xyo-network/diviner-payload-pointer-model'

import { combineRules } from '../combineRules.ts'

// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

const validRules = (): PayloadRule[][] => {
  return [[{ schema: 'network.xyo.debug' }], [{ order: 'desc', timestamp: Date.now() }]]
}

describe('combineRules', () => {
  describe('with no rules', () => {
    it('should throw', () => {
      expect(() => {
        combineRules([])
      }).toThrow()
    })
    it('for addresses defaults to an empty array', () => {
      const rules = validRules()
      const actual = combineRules(rules)
      expect(actual.addresses.length).toBe(0)
    })
    it('for schema should throw', () => {
      expect(() => {
        const rules = validRules().filter(rule => !(rule?.[0] as PayloadSchemaRule)?.schema)
        combineRules(rules)
      }).toThrow()
    })
    describe('for timestamp defaults to', () => {
      it('timestamp set to current time', () => {
        const rules = validRules().filter(rule => !(rule?.[0] as PayloadTimestampOrderRule)?.timestamp)
        const actual = combineRules(rules)
        expect(actual.timestamp).toBe(+now)
      })
      it('direction defaults to desc', () => {
        const rules = validRules().filter(rule => !(rule?.[0] as PayloadTimestampOrderRule)?.timestamp)
        const actual = combineRules(rules)
        expect(actual.order).toBe('desc')
      })
    })
  })
  describe('with PayloadAddressRule rules', () => {
    it('combines multiple rules', () => {
      const rules = validRules()
      const addressRules: PayloadAddressRule[] = [{ address: 'foo' }, { address: 'bar' }]
      rules.push(addressRules)
      const actual = combineRules(rules)
      expect(actual.addresses.sort()).toEqual(['bar', 'foo'])
    })
  })
  describe('with PayloadSchemaRule rules', () => {
    it('combines multiple rules', () => {
      const rules: PayloadRule[][] = [[{ order: 'desc', timestamp: Date.now() }], [{ schema: 'network.xyo.test' }, { schema: 'network.xyo.debug' }]]
      const actual = combineRules(rules)
      expect(actual.schemas.sort()).toEqual(['network.xyo.debug', 'network.xyo.test'])
    })
  })
  describe('with PayloadTimestampDirectionRule rules', () => {
    it('should only allow one rule', () => {
      const rules: PayloadRule[][] = [
        [{ schema: 'network.xyo.debug' }],
        [
          { order: 'desc', timestamp: Date.now() },
          { order: 'asc', timestamp: Date.now() },
        ],
      ]
      expect(() => {
        combineRules(rules)
      }).toThrow()
    })
  })
})
