import { XyoPayloadBuilder } from './Builder'

const schema = 'network.xyo.temp'

const payloadHash = '9b4e701c5a0dd06d270237fd0794eea7cd8713f80e8e35159ef19511a1aeaa69'

const ADDITIONAL_FIELD_COUNT = 4

describe('XyoBoundWitnessBuilder', () => {
  test('build', () => {
    let builder = new XyoPayloadBuilder({ schema })
    expect(builder).toBeDefined()
    builder = builder.fields({
      testArray: [1, 2, 3],
      testBoolean: true,
      testNull: null,
      testNullObject: { t: null, x: undefined },
      testNumber: 5,
      testObject: { t: 1 },
      testSomeNullObject: { s: 1, t: null, x: undefined },
      testString: 'hi',
      testUndefined: undefined,
    })
    expect(builder).toBeDefined()

    const actual = builder.build()

    expect(actual).toBeDefined()
    expect(actual._timestamp).toBeDefined()
    expect(actual._client).toBeDefined()
    expect(actual._hash).toBeDefined()
    expect(actual.schema).toBeDefined()
    expect(actual.testNullObject).toBeUndefined()
    expect(Object.keys(actual).length).toBe(6 + ADDITIONAL_FIELD_COUNT)
    expect(Object.keys(actual.testSomeNullObject as object).length).toBe(1)
    expect(actual._hash).toEqual(payloadHash)
  })
})
