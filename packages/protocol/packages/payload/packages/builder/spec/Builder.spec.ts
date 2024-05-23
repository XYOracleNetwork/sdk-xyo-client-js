import { Payload } from '@xyo-network/payload-model'

import { PayloadBuilder } from '../src'

const schema = 'network.xyo.temp'

describe('BoundWitnessBuilder', () => {
  test('build', async () => {
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

    const actual = await builder.build({ stamp: true })

    expect(actual).toBeDefined()
    expect(actual._timestamp).toBeUndefined()
    expect(actual._client).toBeUndefined()
    expect(actual._hash).toBeUndefined()
    expect(actual.schema).toBeDefined()
    expect(actual.$meta?.timestamp).toBeNumber()
    expect(Object.keys(actual).length).toBeGreaterThan(1)
    expect(Object.keys(actual.testSomeNullObject as object).length).toBe(2)

    let builderNoStamp = new PayloadBuilder<Payload<Record<string, unknown>>>({ schema })
    expect(builderNoStamp).toBeDefined()
    builderNoStamp = builderNoStamp.fields({
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
    expect(builderNoStamp).toBeDefined()

    const actualNoStamp = await builderNoStamp.build({ stamp: false })

    expect(actualNoStamp).toBeDefined()
    expect(actualNoStamp._timestamp).toBeUndefined()
    expect(actualNoStamp._client).toBeUndefined()
    expect(actualNoStamp._hash).toBeUndefined()
    expect(actualNoStamp.schema).toBeDefined()
    expect(actualNoStamp.$meta?.timestamp).toBeUndefined()
    expect(Object.keys(actualNoStamp).length).toBeGreaterThan(1)
    expect(Object.keys(actualNoStamp.testSomeNullObject as object).length).toBe(2)
  })
})
