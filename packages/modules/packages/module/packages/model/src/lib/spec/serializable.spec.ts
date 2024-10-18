import {
  describe, expect, it,
} from 'vitest'

import { isSerializable } from '../serializable.ts'

/**
 * @group module
 */

describe('isSerializable', () => {
  it('string', () => {
    expect(isSerializable('HI')).toBe(true)
  })

  it('number', () => {
    expect(isSerializable(23_454)).toBe(true)
  })

  it('null', () => {
    expect(isSerializable(null)).toBe(true)
  })

  it('undefined', () => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(isSerializable(undefined)).toBe(false)
  })

  it('Class', () => {
    class TestClass {
      foo = 'foo'
    }
    expect(isSerializable(new TestClass())).toBe(true)
  })

  it('Class', () => {
    class TestClass {
      foo = 'foo'
      fooFunc = () => 10
    }
    expect(isSerializable(new TestClass())).toBe(false)
  })

  it('Map', () => {
    expect(isSerializable(new Map())).toBe(false)
  })

  it('Symbol', () => {
    expect(isSerializable(Symbol())).toBe(false)
  })

  it('Set', () => {
    expect(isSerializable(new Set())).toBe(false)
  })

  it('plain obj', () => {
    expect(isSerializable({ p: 1, p2: 'hi' })).toBe(true)
  })
})

describe('serializable', () => {
  it('plain obj with func', () => {
    expect(
      isSerializable({
        p: 1,
        p2: () => {
          return
        },
      }),
    ).toBe(false)
  })

  it('nested obj with func', () => {
    expect(
      isSerializable({
        n: {
          nn: {
            nnm: () => {
              return
            },
            nnn: 1,
          },
        },
        p: 1,
        p2: 'hi',
      }),
    ).toBe(false)
  })

  it('array with func', () => {
    expect(isSerializable([1, 2, 3, () => false])).toBe(false)
  })

  it('array with nested obj', () => {
    expect(isSerializable([1, 2, 3, { nn: { nnm: 'Hi', nnn: 1 } }])).toBe(true)
  })

  it('array with nested obj with func', () => {
    expect(
      isSerializable([
        1,
        2,
        3,
        {
          nn: {
            nnm: () => {
              return
            },
            nnn: 1,
          },
        },
      ]),
    ).toBe(false)
  })
})
