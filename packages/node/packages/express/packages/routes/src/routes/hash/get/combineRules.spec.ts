import { PayloadAddressRule, PayloadArchiveRule, PayloadRule, PayloadSchemaRule, PayloadTimestampDirectionRule } from '@xyo-network/node-core-model'

import { combineRules } from './combineRules'

// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

const validRules = (): PayloadRule[][] => {
  return [[{ archive: 'foo' }], [{ schema: 'network.xyo.debug' }], [{ direction: 'desc', timestamp: Date.now() }]]
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
    it('for archive should throw', () => {
      expect(() => {
        const rules = validRules().filter((rule) => !(rule?.[0] as PayloadArchiveRule)?.archive)
        combineRules(rules)
      }).toThrow()
    })
    it('for schema should throw', () => {
      expect(() => {
        const rules = validRules().filter((rule) => !(rule?.[0] as PayloadSchemaRule)?.schema)
        combineRules(rules)
      }).toThrow()
    })
    describe('for timestamp defaults to', () => {
      it('timestamp set to current time', () => {
        const rules = validRules().filter((rule) => !(rule?.[0] as PayloadTimestampDirectionRule)?.timestamp)
        const actual = combineRules(rules)
        expect(actual.timestamp).toBe(+now)
      })
      it('direction defaults to desc', () => {
        const rules = validRules().filter((rule) => !(rule?.[0] as PayloadTimestampDirectionRule)?.timestamp)
        const actual = combineRules(rules)
        expect(actual.direction).toBe('desc')
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
  describe('with PayloadArchiveRule rules', () => {
    it('combines multiple rules', () => {
      const rules = [[{ archive: 'foo' }, { archive: 'bar' }], [{ schema: 'network.xyo.debug' }]]
      const actual = combineRules(rules)
      expect(actual.archives.sort()).toEqual(['bar', 'foo'])
    })
  })
  describe('with PayloadSchemaRule rules', () => {
    it('combines multiple rules', () => {
      const rules = [[{ archive: 'foo' }], [{ schema: 'network.xyo.test' }, { schema: 'network.xyo.debug' }]]
      const actual = combineRules(rules)
      expect(actual.schemas.sort()).toEqual(['network.xyo.debug', 'network.xyo.test'])
    })
  })
  describe('with PayloadTimestampDirectionRule rules', () => {
    it('should only allow one rule', () => {
      const rules: PayloadRule[][] = [
        [{ archive: 'foo' }],
        [{ schema: 'network.xyo.debug' }],
        [
          { direction: 'desc', timestamp: Date.now() },
          { direction: 'asc', timestamp: Date.now() },
        ],
      ]
      expect(() => {
        combineRules(rules)
      }).toThrow()
    })
  })
})
