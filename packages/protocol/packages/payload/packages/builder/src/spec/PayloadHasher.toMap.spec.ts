/* eslint-disable @typescript-eslint/no-unused-vars */
import { AnyObject } from '@xylabs/object'
import { PayloadHasher } from '@xyo-network/hash'
import { Payload } from '@xyo-network/payload-model'

import { PayloadBuilder } from '../index.ts'

describe('PayloadBuilder', () => {
  const testObject = {
    schema: 'network.xyo.test',
    testArray: [1, 2, 3],
    testBoolean: true,
    testNull: null,
    testNullObject: { t: null, x: null },
    testNumber: 5,
    testObject: { t: 1 },
    testSomeNullObject: { s: 1, t: null, x: null },
    testString: 'hello there.  this is a pretty long string.  what do you think?',
  }
  const bigObject = {
    schema: 'network.xyo.test',
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
        { a: 0, schema: 'network.xyo.test.a' },
        { b: 1, schema: 'network.xyo.test.b' },
      ] satisfies Payload<AnyObject>[],
    ],
    [
      'Preserves ordering of input payloads when creating object keys',
      [
        { a: 0, schema: 'network.xyo.test.a' },
        { b: 1, schema: 'network.xyo.test.b' },
        { c: 2, schema: 'network.xyo.test.c' },
        { d: 3, schema: 'network.xyo.test.d' },
        { e: 4, schema: 'network.xyo.test.e' },
        { f: 5, schema: 'network.xyo.test.f' },
        { g: 6, schema: 'network.xyo.test.g' },
        { h: 7, schema: 'network.xyo.test.h' },
        { i: 8, schema: 'network.xyo.test.i' },
        { j: 9, schema: 'network.xyo.test.j' },
        { k: 10, schema: 'network.xyo.test.k' },
        { l: 11, schema: 'network.xyo.test.l' },
        { m: 12, schema: 'network.xyo.test.m' },
        bigObject,
        { n: 13, schema: 'network.xyo.test.n' },
        { o: 14, schema: 'network.xyo.test.o' },
        { p: 15, schema: 'network.xyo.test.p' },
        { q: 16, schema: 'network.xyo.test.q' },
        { r: 17, schema: 'network.xyo.test.r' },
        { s: 18, schema: 'network.xyo.test.s' },
        { schema: 'network.xyo.test.t', t: 19 },
        { schema: 'network.xyo.test.u', u: 20 },
        { schema: 'network.xyo.test.v', v: 21 },
        { schema: 'network.xyo.test.w', w: 22 },
        { schema: 'network.xyo.test.x', x: 23 },
        { schema: 'network.xyo.test.y', y: 24 },
        { schema: 'network.xyo.test.z', z: 25 },
      ] satisfies Payload<AnyObject>[],
    ],
  ]
  beforeAll(async () => {
    PayloadHasher.wasmSupport.allowWasm = true
    await PayloadHasher.wasmInitialized
  })
  it.each(cases)('%s', async (_title, sources) => {
    const map = await PayloadBuilder.toDataHashMap(sources)
    expect(Object.keys(map).length).toBe(sources.length)
    await Promise.all(
      Object.entries(map).map(async ([hash, payload], index) => {
        const source = await PayloadBuilder.build(sources[index])
        const { $meta: m1, ...sourceWithoutMeta } = source
        const { $meta: m2, ...payloadWithoutMeta } = payload
        expect(sourceWithoutMeta).toEqual(payloadWithoutMeta)
        expect(sourceWithoutMeta.$hash).toEqual(hash)
      }),
    )
  })
})
