import '@xylabs/vitest-extended'

import {
  beforeAll, describe, expect, test,
} from 'vitest'

import { NodeObjectHasher as ObjectHasher } from '../NodeObjectHasher.ts'

const perfIterations = 50

describe('Hasher', () => {
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
  test('wasm vs js (compatibility-sync)', async () => {
    ObjectHasher.warnIfUsingJsHash = false
    ObjectHasher.allowSubtle = false
    ObjectHasher.wasmSupport.allowWasm = false
    const jsHash = await ObjectHasher.hash(testObject)
    ObjectHasher.wasmSupport.allowWasm = true
    const wasmHash = await ObjectHasher.hash(testObject)
    expect(jsHash).toEqual(wasmHash)
  })

  test('wasm vs js (compatibility-async)', async () => {
    ObjectHasher.warnIfUsingJsHash = false
    ObjectHasher.allowSubtle = false
    ObjectHasher.wasmSupport.allowWasm = false
    const jsHash = await ObjectHasher.hash(testObject)
    ObjectHasher.wasmSupport.allowWasm = true
    const wasmHash = await ObjectHasher.hash(testObject)
    expect(jsHash).toEqual(wasmHash)
  })

  test('subtle vs js (compatibility-async)', async () => {
    ObjectHasher.warnIfUsingJsHash = false
    ObjectHasher.allowSubtle = false
    ObjectHasher.wasmSupport.allowWasm = false
    const jsHash = await ObjectHasher.hash(testObject)
    ObjectHasher.allowSubtle = true
    const subtleHash = await ObjectHasher.hash(testObject)
    expect(jsHash).toEqual(subtleHash)
  })

  test('wasm vs js (performance-serial)', async () => {
    ObjectHasher.warnIfUsingJsHash = false
    ObjectHasher.allowSubtle = false
    ObjectHasher.wasmSupport.allowWasm = false
    const jsHashStart = Date.now()
    for (let x = 0; x < perfIterations; x++) {
      await ObjectHasher.hash({ ...testObject, nonce: x })
    }
    const jsHashDuration = Date.now() - jsHashStart
    ObjectHasher.wasmSupport.allowWasm = true
    const wasmHashStart = Date.now()
    for (let x = 0; x < perfIterations; x++) {
      await ObjectHasher.hash({ ...testObject, nonce: x })
    }
    const wasmHashDuration = Date.now() - wasmHashStart
    expect(wasmHashDuration).toBeDefined()
    expect(jsHashDuration).toBeDefined()
    console.log(
      `Wasm (serial) is ${jsHashDuration - wasmHashDuration}ms (${((1 - wasmHashDuration / jsHashDuration) * 100).toPrecision(
        2,
      )}%) faster [${wasmHashDuration}ms vs ${jsHashDuration}ms ]`,
    )
  })

  test.skip('wasm vs js (performance-parallel)', async () => {
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
    ObjectHasher.allowSubtle = false
    ObjectHasher.wasmSupport.allowWasm = true
    const wasmTestObjects: ObjectHasher[] = []
    for (let x = 0; x < perfIterations; x++) {
      wasmTestObjects.push(new ObjectHasher({ ...testObject, nonce: x }))
    }
    const wasmHashStart = Date.now()
    await Promise.all(wasmTestObjects.map(obj => obj.hash()))
    const wasmHashDuration = Date.now() - wasmHashStart
    expect(wasmHashDuration).toBeDefined()
    expect(jsHashDuration).toBeDefined()
    console.log(
      `Wasm (parallel) is ${jsHashDuration - wasmHashDuration}ms (${((1 - wasmHashDuration / jsHashDuration) * 100).toPrecision(
        2,
      )}%) faster than js [${wasmHashDuration}ms vs ${jsHashDuration}ms ]`,
    )
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
