import { Payload } from '@xyo-network/payload-model'

import { PayloadBuilder } from '../Builder.ts'

const schema = 'network.xyo.temp'

import '@xylabs/vitest-extended'

import { ObjectHasher } from '@xyo-network/hash'
import {
  describe, expect, test,
} from 'vitest'

describe('PayloadBuilder', () => {
  test('build', () => {
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
      testSomeNullObject: {
        s: 1, t: null, x: undefined,
      },
      testString: 'hi',
      testUndefined: undefined,
      testUnderscoreObject: { _test: 1 },
      testUnderscoreObjectInArray: [{ _test: 1 }],
    })
    expect(builder).toBeDefined()

    const actual = builder.build()

    expect(actual).toBeDefined()
    expect(actual._timestamp).toBeUndefined()
    expect(actual._client).toBeUndefined()
    expect(actual._hash).toBeUndefined()
    expect(actual._testUnderscore).toBeUndefined()
    expect(actual.$testDollar).toBeUndefined()
    expect(actual.schema).toBeDefined()
    expect(Object.keys(actual).length).toBeGreaterThan(1)
    expect(Object.keys(actual.testSomeNullObject as object).length).toBe(2)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((actual as any).testUnderscoreObject._test).toBeUndefined()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((actual as any).testUnderscoreObjectInArray[0]._test).toBeUndefined()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((actual as any).testDollarObject.$test).toBeUndefined()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((actual as any).testDollarObjectInArray[0].$test).toBeUndefined()

    let builderNoStamp = new PayloadBuilder<Payload<Record<string, unknown>>>({ schema })
    expect(builderNoStamp).toBeDefined()
    builderNoStamp = builderNoStamp.fields({
      testArray: [1, 2, 3],
      testBoolean: true,
      testNull: null,
      testNullObject: { t: null, x: undefined },
      testNumber: 5,
      testObject: { t: 1 },
      testSomeNullObject: {
        s: 1, t: null, x: undefined,
      },
      testString: 'hi',
      testUndefined: undefined,
    })
    expect(builderNoStamp).toBeDefined()

    const actualNoStamp = builderNoStamp.build()

    expect(actualNoStamp).toBeDefined()
    expect(actualNoStamp._timestamp).toBeUndefined()
    expect(actualNoStamp._client).toBeUndefined()
    expect(actualNoStamp._hash).toBeUndefined()
    expect(actualNoStamp.schema).toBeDefined()
    expect(Object.keys(actualNoStamp).length).toBeGreaterThan(1)
    expect(Object.keys(actualNoStamp.testSomeNullObject as object).length).toBe(2)
  })
})

describe('PayloadBuilder', () => {
  test('hash', async () => {
    const value = {
      $meta_field: 'yo',
      currentLocation: {
        coords: {
          accuracy: 5,
          altitude: 15,
          altitudeAccuracy: 15,
          heading: 90,
          latitude: 37.7749,
          longitude: -122.4194,
          speed: 2.5,
        },
        timestamp: 1_609_459_200_000,
      },
      schema: 'network.xyo.location.current',
    }
    const dh = await PayloadBuilder.dataHash(value)
    const h = await PayloadBuilder.hash(value)
    expect(dh).toBe('0c1f0c80481b0f391a677eab542a594a192081325b6416acc3dc99db23355ee2')
    expect(h).toBe('d1685b23bbc87c0260620fa6ff3581ffd48574bd326cb472425d4db787af487f')
  })
})

describe('PayloadBuilder', () => {
  test('hash', async () => {
    const value = {
      $hash: '6f731b3956114fd0d18820dbbe1116f9e36dc8d803b0bb049302f7109037468f',
      $meta: {
        client: 'ios',
        signatures: ['fad86c98252b937a65be61f2307ce6d427a08425b4aee1c90fea0b446e9c862f46b6a36fea69450f83dadf9a2409c4f9ddc2e39a3dc222ae06f81b19eb2a17e6'],
      },
      addresses: ['e3b3bb3cdc49e13f9ac5f48d52915368de43afec'],
      payload_hashes: ['c915c56dd93b5e0db509d1a63ca540cfb211e11f03039b05e19712267bb8b6db'],
      payload_schemas: ['network.xyo.test'],
      previous_hashes: [null],
      schema: 'network.xyo.boundwitness',
    }
    const value2 = {
      addresses: ['e3b3bb3cdc49e13f9ac5f48d52915368de43afec'],
      payload_hashes: ['c915c56dd93b5e0db509d1a63ca540cfb211e11f03039b05e19712267bb8b6db'],
      payload_schemas: ['network.xyo.test'],
      previous_hashes: [null],
      schema: 'network.xyo.boundwitness',
    }
    console.log('payload', PayloadBuilder.omitMeta(value))
    const dh = await PayloadBuilder.dataHash(value)
    const dh2 = await PayloadBuilder.dataHash(value2)
    const h = await PayloadBuilder.hash(value)
    expect(dh).toBe(dh2)
    expect(dh).toBe('6f731b3956114fd0d18820dbbe1116f9e36dc8d803b0bb049302f7109037468f')
    expect(h).toBe('c267291c8169e428aaedbbf52792f9378ee03910401ef882b653a75f85370722')
  })
})

describe('temp', () => {
  test('kotlin-data-hash', async () => {
    const payload = {
      $meta: {
        client: 'android',
        signatures: ['493178d0b896818e2185ca424738cd6d4cac94990af9c1a238c02e51baa387b3354058c32ef0e601c8e6201ff677bf97885169140e6e36778dc41ecd6bf362d7'],
      },
      addresses: ['9858effd232b4033e47d90003d41ec34ecaeda94'],
      payload_hashes: ['4ca087085f26a7c3961b450457a8e44307f331ecf2580bb952fdacdcb7be4cd7'],
      payload_schemas: ['network.xyo.test'],
      previous_hashes: [null],
      schema: 'network.xyo.boundwitness',
    }
    const payload2String = ObjectHasher.stringifyHashFields(payload)
    const enc = new TextEncoder()
    const data = enc.encode(payload2String)
    var total = 0
    for (const datum of data) {
      total += datum
    }
    console.log('total', total)
    console.log('len', data.length)
    const hash2 = await ObjectHasher.hash(payload)
    expect(hash2).toBe('79f9ff8083f5b1dde361d48b583821bd2b78723a29b422c8d6aefaed5bcba981')
  })
})
