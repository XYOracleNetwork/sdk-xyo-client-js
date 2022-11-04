import { serializable } from './serializable'

describe('serializable', () => {
  it('string', () => {
    expect(serializable('HI')).toBeTrue()
  })

  it('number', () => {
    expect(serializable(23454)).toBeTrue()
  })

  it('null', () => {
    expect(serializable(null)).toBeTrue()
  })

  it('undefined', () => {
    expect(serializable(undefined)).toBeTrue()
  })

  it('Class', () => {
    class TestClass {
      foo = 'foo'
    }
    expect(serializable(new TestClass())).toBeFalse()
  })

  it('Map', () => {
    expect(serializable(new Map())).toBeFalse()
  })

  it('Symbol', () => {
    expect(serializable(Symbol())).toBeFalse()
  })

  it('Set', () => {
    expect(serializable(new Set())).toBeFalse()
  })

  it('plain obj', () => {
    expect(serializable({ p: 1, p2: 'hi' })).toBeTrue()
  })

  it('plain obj with func', () => {
    expect(
      serializable({
        p: 1,
        p2: () => {
          return
        },
      }),
    ).toBeFalse()
  })

  it('nested obj with func', () => {
    expect(
      serializable({
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
    ).toBeFalse()
  })

  it('array', () => {
    expect(serializable([1, 2, 3, 5])).toBeTrue()
  })

  it('array with func', () => {
    expect(serializable([1, 2, 3, () => false])).toBeFalse()
  })

  it('array with nested obj', () => {
    expect(serializable([1, 2, 3, { nn: { nnm: 'Hi', nnn: 1 } }])).toBeTrue()
  })

  it('array with nested obj with func', () => {
    expect(
      serializable([
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
    ).toBeFalse
  })

  it('maximum depth', () => {
    const complexObj = { p: { p: { p: { p: { p: { p: 'foo' } } } } } }
    expect(serializable(complexObj, 6)).toBeNull()
    expect(serializable(complexObj, 7)).toBeTrue()
  })
})
