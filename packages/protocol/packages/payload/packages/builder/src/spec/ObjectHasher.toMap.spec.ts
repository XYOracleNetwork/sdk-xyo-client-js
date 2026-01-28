import '@xylabs/vitest-extended'

import type { AnyObject } from '@xylabs/sdk-js'
import { ObjectHasher } from '@xyo-network/hash'
import { asSchema, type Payload } from '@xyo-network/payload-model'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { PayloadBuilder } from '../Builder.ts'

describe('PayloadBuilder', () => {
  const testObject = {
    schema: asSchema('network.xyo.test', true),
    testArray: [1, 2, 3],
    testBoolean: true,
    testNull: null,
    testNullObject: { t: null, x: null },
    testNumber: 5,
    testObject: { t: 1 },
    testSomeNullObject: {
      s: 1, t: null, x: null,
    },
    testString: 'hello there.  this is a pretty long string.  what do you think?',
  }
  const bigObject = {
    schema: asSchema('network.xyo.test', true),
    testArray: [1, 2, 3],
    testBoolean: true,
    testNull: null,
    testNullObject: { t: null, x: null },
    testNumber: 5,
    testObjArray: [testObject],
    testObject: { t: 1 },
    testSomeNullObject: { s: 1, t: null },
    testString: 'hello there.  this is a pretty long string.  what do you think?',
  }
  for (let i = 0; i < 1000; i++) {
    bigObject.testObjArray.push(testObject)
  }
  const cases: [string, Payload<AnyObject>[]][] = [
    [
      'Hashes input payloads to a map',
      [
        { a: 0, schema: asSchema('network.xyo.test.a', true) },
        { b: 1, schema: asSchema('network.xyo.test.b', true) },
      ] satisfies Payload<AnyObject>[],
    ],
    [
      'Preserves ordering of input payloads when creating object keys',
      [
        { a: 0, schema: asSchema('network.xyo.test.a', true) },
        { b: 1, schema: asSchema('network.xyo.test.b', true) },
        { c: 2, schema: asSchema('network.xyo.test.c', true) },
        { d: 3, schema: asSchema('network.xyo.test.d', true) },
        { e: 4, schema: asSchema('network.xyo.test.e', true) },
        { f: 5, schema: asSchema('network.xyo.test.f', true) },
        { g: 6, schema: asSchema('network.xyo.test.g', true) },
        { h: 7, schema: asSchema('network.xyo.test.h', true) },
        { i: 8, schema: asSchema('network.xyo.test.i', true) },
        { j: 9, schema: asSchema('network.xyo.test.j', true) },
        { k: 10, schema: asSchema('network.xyo.test.k', true) },
        { l: 11, schema: asSchema('network.xyo.test.l', true) },
        { m: 12, schema: asSchema('network.xyo.test.m', true) },
        bigObject,
        { n: 13, schema: asSchema('network.xyo.test.n', true) },
        { o: 14, schema: asSchema('network.xyo.test.o', true) },
        { p: 15, schema: asSchema('network.xyo.test.p', true) },
        { q: 16, schema: asSchema('network.xyo.test.q', true) },
        { r: 17, schema: asSchema('network.xyo.test.r', true) },
        { s: 18, schema: asSchema('network.xyo.test.s', true) },
        { schema: asSchema('network.xyo.test.t', true), t: 19 },
        { schema: asSchema('network.xyo.test.u', true), u: 20 },
        { schema: asSchema('network.xyo.test.v', true), v: 21 },
        { schema: asSchema('network.xyo.test.w', true), w: 22 },
        { schema: asSchema('network.xyo.test.x', true), x: 23 },
        { schema: asSchema('network.xyo.test.y', true), y: 24 },
        { schema: asSchema('network.xyo.test.z', true), z: 25 },
      ] satisfies Payload<AnyObject>[],
    ],
  ]
  beforeAll(async () => {
    ObjectHasher.wasmSupport.allowWasm = true
    await ObjectHasher.wasmInitialized
  })
  it.each(cases)('%s', async (_title, sources) => {
    const map = await PayloadBuilder.toDataHashMap(sources)
    expect(Object.keys(map).length).toBe(sources.length)
    await Promise.all(Object.entries(map).map(async ([hash, payload], index) => {
      const source = sources[index]
      const { $meta: m1, ...sourceWithoutMeta } = source
      const { $meta: m2, ...payloadWithoutMeta } = payload
      expect(sourceWithoutMeta).toEqual(payloadWithoutMeta)
      expect(await PayloadBuilder.dataHash(sourceWithoutMeta)).toEqual(hash)
    }))
  })
})
