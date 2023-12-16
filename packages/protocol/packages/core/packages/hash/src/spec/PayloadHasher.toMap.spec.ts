import { AnyObject } from '@xyo-network/object'

import { PayloadHasher } from '../PayloadHasher'

describe('PayloadHasher', () => {
  const testObject = {
    testArray: [1, 2, 3],
    testBoolean: true,
    testNull: null,
    testNullObject: { t: null, x: undefined },
    testNumber: 5,
    testObject: { t: 1 },
    testSomeNullObject: { s: 1, t: null, x: undefined },
    testString: 'hello there.  this is a pretty long string.  what do you think?',
    testUndefined: undefined,
  }
  const bigObject = {
    testArray: [1, 2, 3],
    testBoolean: true,
    testNull: null,
    testNullObject: { t: null, x: undefined },
    testNumber: 5,
    testObjArray: [testObject],
    testObject: { t: 1 },
    testSomeNullObject: { s: 1, t: null, x: undefined },
    testString: 'hello there.  this is a pretty long string.  what do you think?',
    testUndefined: undefined,
  }
  for (let i = 0; i < 1000; i++) {
    bigObject.testObjArray.push(testObject)
  }
  const cases: [string, AnyObject[]][] = [
    [
      'Hashes input payloads to a map',
      [
        { a: 0, schema: 'network.xyo.test.a' },
        { b: 1, schema: 'network.xyo.test.b' },
      ],
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
      ],
    ],
  ]
  beforeAll(async () => {
    PayloadHasher.wasmSupport.allowWasm = true
    await PayloadHasher.wasmInitialized
  })
  it.each(cases)('%s', async (_title, ...sources) => {
    const map = await PayloadHasher.toMap(sources)
    expect(Object.keys(map).length).toBe(sources.length)
    await Promise.all(
      Object.entries(map).map(async ([hash, payload], index) => {
        const source = sources[index]
        const sourceHash = await PayloadHasher.hashAsync(source)
        expect(source).toEqual(payload)
        expect(sourceHash).toEqual(hash)
      }),
    )
  })
})
