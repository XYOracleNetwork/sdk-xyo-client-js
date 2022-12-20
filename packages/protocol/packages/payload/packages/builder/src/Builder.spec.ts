import { XyoPayload } from '@xyo-network/payload-model'

import { XyoPayloadBuilder } from './Builder'

const schema = 'network.xyo.temp'

const payloadHash = '57b78b1b7df3ac0369654642e879cdf2f3c95f9c5949bcb34ea3cb8309c538b4'

const ADDITIONAL_FIELD_COUNT = 4

describe('XyoBoundWitnessBuilder', () => {
  test('build', () => {
    let builder = new XyoPayloadBuilder<XyoPayload<Record<string, unknown>>>({ schema })
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
