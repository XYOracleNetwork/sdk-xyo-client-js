import { NodeObjectHasher as ObjectHasher } from '../NodeObjectHasher.ts'

const perfIterations = 1000

import '@xylabs/vitest-extended'

import {
  beforeAll, describe, expect, test,
} from 'vitest'

describe('Hasher - Subtle performance', () => {
  const testObject = {
    testArray: [1, 2, 3],
    testBoolean: true,
    testNull: null,
    testNullObject: { t: null, x: undefined },
    testNumber: 5,
    testObject: { t: 1 },
    testSomeNullObject: {
      s: 1, t: null, x: undefined,
    },
    testString: 'hello there.  this is a pretty long string.  what do you think?',
    testUndefined: undefined,
  }

  beforeAll(async () => {
    await ObjectHasher.wasmInitialized
  })
  test('subtle vs js (performance-parallel)', async () => {
    ObjectHasher.warnIfUsingJsHash = false
    ObjectHasher.allowSubtle = false
    ObjectHasher.wasmSupport.allowWasm = false
    const jsTestObjects: ObjectHasher[] = []
    for (let x = 0; x < perfIterations; x++) {
      jsTestObjects.push(new ObjectHasher({ ...testObject, nonce: x }))
    }
    const jsHashStart = Date.now()
    await Promise.all(jsTestObjects.map(obj => obj.hash()))
    const jsHashDuration = Date.now() - jsHashStart

    ObjectHasher.warnIfUsingJsHash = true
    ObjectHasher.allowSubtle = true
    ObjectHasher.wasmSupport.allowWasm = false
    const subtleTestObjects: ObjectHasher[] = []
    for (let x = 0; x < perfIterations; x++) {
      subtleTestObjects.push(new ObjectHasher({ ...testObject, nonce: x }))
    }
    const subtleHashStart = Date.now()
    await Promise.all(subtleTestObjects.map(obj => obj.hash()))
    const subtleHashDuration = Date.now() - subtleHashStart
    expect(subtleHashDuration).toBeDefined()
    expect(jsHashDuration).toBeDefined()
    console.log(
      `Subtle (parallel) is ${jsHashDuration - subtleHashDuration}ms (${((1 - subtleHashDuration / jsHashDuration) * 100).toPrecision(
        2,
      )}%) faster than js [${subtleHashDuration}ms vs ${jsHashDuration}ms ]`,
    )
  })
})
