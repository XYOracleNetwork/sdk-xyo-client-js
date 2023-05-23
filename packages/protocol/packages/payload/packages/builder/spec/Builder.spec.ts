import { Payload } from '@xyo-network/payload-model'

import { PayloadBuilder } from '../src'

const schema = 'network.xyo.temp'

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
