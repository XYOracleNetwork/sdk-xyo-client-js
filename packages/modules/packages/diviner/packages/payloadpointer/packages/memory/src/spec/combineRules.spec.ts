import '@xylabs/vitest-extended'

import type {
  PayloadAddressRule, PayloadRule, PayloadSchemaRule, PayloadSequenceOrderRule,
} from '@xyo-network/diviner-payload-pointer-model'
import { SequenceConstants } from '@xyo-network/payload-model'
import {
  describe, expect, it,
} from 'vitest'

import { combineRules } from '../combineRules.ts'

const validRules = (): PayloadRule[][] => {
  return [
    [{ schema: 'network.xyo.debug' }],
    [{ order: 'desc', sequence: SequenceConstants.maxLocalSequence }],
  ]
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
    describe('for sequence defaults to', () => {
      it('sequence set to current time', () => {
        const rules = validRules().filter(rule => !(rule?.[0] as PayloadSequenceOrderRule)?.sequence)
        const actual = combineRules(rules)
        expect(actual.cursor).toBe(undefined)
      })
      it('direction defaults to desc', () => {
        const rules = validRules().filter(rule => !(rule?.[0] as PayloadSequenceOrderRule)?.sequence)
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
      const rules: PayloadRule[][] = [
        [{ order: 'desc', sequence: SequenceConstants.maxLocalSequence }],
        [{ schema: 'network.xyo.test' }, { schema: 'network.xyo.debug' }],
      ]
      const actual = combineRules(rules)
      expect(actual.schemas.sort()).toEqual(['network.xyo.debug', 'network.xyo.test'])
    })
  })
  describe('with multiple PayloadSequenceDirectionRule rules', () => {
    it('should only allow one rule', () => {
      const rules: PayloadRule[][] = [
        [{ schema: 'network.xyo.debug' }],
        [
          { order: 'desc', sequence: SequenceConstants.maxLocalSequence },
          { order: 'asc', sequence: SequenceConstants.minLocalSequence },
        ],
      ]
      expect(() => {
        combineRules(rules)
      }).toThrow()
    })
  })
})
