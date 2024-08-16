import type { Payload } from '@xyo-network/payload-model'

import { PayloadBuilder } from '../Builder.ts'

const schema = 'network.xyo.temp'

describe('PayloadBuilder', () => {
  test('build', async () => {
    let builder = new PayloadBuilder<Payload<Record<string, unknown>>>({ schema })
    expect(builder).toBeDefined()
    builder = builder.fields({
      $testDollar: 1,
      _testUnderscore: 1,
      testArray: [1, 2, 3],
      testBoolean: true,
      testDollarObject: { $test: 1 },
      testDollarObjectInArray: [{ $test: 1 }],
      testNull: null,
      testNullObject: { t: null, x: undefined },
      testNumber: 5,
      testObject: { t: 1 },
      testSomeNullObject: { s: 1, t: null, x: undefined },
      testString: 'hi',
      testUndefined: undefined,
      testUnderscoreObject: { _test: 1 },
      testUnderscoreObjectInArray: [{ _test: 1 }],
    })
    expect(builder).toBeDefined()

    const actual = await builder.build({ stamp: true })

    expect(actual).toBeDefined()
    expect(actual._timestamp).toBeUndefined()
    expect(actual._client).toBeUndefined()
    expect(actual._hash).toBeUndefined()
    expect(actual._testUnderscore).toBeUndefined()
    expect(actual.$testDollar).toBeUndefined()
    expect(actual.schema).toBeDefined()
    expect(actual.$meta?.timestamp).toBeNumber()
    expect(Object.keys(actual).length).toBeGreaterThan(1)
    expect(Object.keys(actual.testSomeNullObject as object).length).toBe(2)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((actual as any).testUnderscoreObject._test).toBeDefined()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((actual as any).testUnderscoreObjectInArray[0]._test).toBeDefined()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((actual as any).testDollarObject.$test).toBeDefined()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((actual as any).testDollarObjectInArray[0].$test).toBeDefined()

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
