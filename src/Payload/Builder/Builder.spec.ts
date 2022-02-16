import { XyoPayloadBuilder } from './Builder'

const schema = 'network.xyo.temp'

const payloadHash = '05f5cb7bef7b49efdacf464d478cafb148f0bd6c1ad874fdb239561c247ea262'

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
    expect(Object.keys(actual).length).toBe(8 + ADDITIONAL_FIELD_COUNT)
    expect(Object.keys(actual.testSomeNullObject as object).length).toBe(2)
    expect(actual._hash).toEqual(payloadHash)
  })
})
