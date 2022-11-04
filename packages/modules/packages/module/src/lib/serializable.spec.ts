import { serializable, serializableField } from './serializable'

describe('serializableField', () => {
  it('string', () => {
    expect(serializableField('HI')).toBeTrue()
  })

  it('number', () => {
    expect(serializableField(23454)).toBeTrue()
  })

  it('null', () => {
    expect(serializableField(null)).toBeTrue()
  })

  it('undefined', () => {
    expect(serializableField(undefined)).toBeTrue()
  })

  it('Class', () => {
    class TestClass {
      foo = 'foo'
    }
    expect(serializableField(new TestClass())).toBeFalse()
  })

  it('Map', () => {
    expect(serializableField(new Map())).toBeFalse()
  })

  it('Symbol', () => {
    expect(serializableField(Symbol())).toBeFalse()
  })

  it('Set', () => {
    expect(serializableField(new Set())).toBeFalse()
  })

  it('plain obj', () => {
    expect(serializableField({ p: 1, p2: 'hi' })).toBeTrue()
  })
})

describe('serializable', () => {
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
