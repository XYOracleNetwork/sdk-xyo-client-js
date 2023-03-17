import { Payload } from '@xyo-network/payload-model'

import { PayloadBuilder } from '../Builder'

const schema = 'network.xyo.temp'

const payloadHash = '57b78b1b7df3ac0369654642e879cdf2f3c95f9c5949bcb34ea3cb8309c538b4'

const ADDITIONAL_FIELD_COUNT = 4

describe('BoundWitnessBuilder', () => {
  test('build', () => {
    let builder = new PayloadBuilder<Payload<Record<string, unknown>>>({ schema })
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
    expect(actual._timestamp).toBeUndefined()
    expect(actual._client).toBeUndefined()
    expect(actual._hash).toBeUndefined()
    expect(actual.schema).toBeDefined()
    expect(Object.keys(actual).length).toBeGreaterThan(1)
    expect(Object.keys(actual.testSomeNullObject as object).length).toBe(2)
  })
})
