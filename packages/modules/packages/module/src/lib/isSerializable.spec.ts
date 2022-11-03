import { isSerializable } from './isSerializable'

describe('isSerializable', () => {
  it('string', () => {
    expect(isSerializable('HI')).toBeTrue()
  })

  it('number', () => {
    expect(isSerializable(23454)).toBeTrue()
  })

  it('null', () => {
    expect(isSerializable(null)).toBeTrue()
  })

  it('undefined', () => {
    expect(isSerializable(undefined)).toBeTrue()
  })

  it('Class', () => {
    class TestClass {
      foo = 'foo'
    }
    expect(isSerializable(new TestClass())).toBeFalse()
  })

  it('Map', () => {
    expect(isSerializable(new Map())).toBeFalse()
  })

  it('Symbol', () => {
    expect(isSerializable(Symbol())).toBeFalse()
  })

  it('Set', () => {
    expect(isSerializable(new Set())).toBeFalse()
  })

  it('plain obj', () => {
    expect(isSerializable({ p: 1, p2: 'hi' })).toBeTrue()
  })

  it('plain obj with func', () => {
    expect(
      isSerializable({
        p: 1,
        p2: () => {
          return
        },
      }),
    ).toBeFalse()
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
    ).toBeFalse()
  })

  it('array', () => {
    expect(isSerializable([1, 2, 3, 5])).toBeTrue()
  })

  it('array with func', () => {
    expect(isSerializable([1, 2, 3, () => false])).toBeFalse()
  })

  it('array with nested obj', () => {
    expect(isSerializable([1, 2, 3, { nn: { nnm: 'Hi', nnn: 1 } }])).toBeTrue()
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
    ).toBeFalse
  })
})
