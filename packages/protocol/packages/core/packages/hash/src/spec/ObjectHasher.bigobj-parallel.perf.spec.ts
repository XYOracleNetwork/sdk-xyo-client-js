/* eslint-disable max-statements */
import '@xylabs/vitest-extended'

import {
  beforeAll,
  describe, expect, test,
} from 'vitest'

import { NodeObjectHasher as ObjectHasher } from '../NodeObjectHasher.ts'

describe('Hasher - BigObject Parallel ', () => {
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
  const bigObject = {
    testArray: [1, 2, 3],
    testBoolean: true,
    testNull: null,
    testNullObject: { t: null, x: undefined },
    testNumber: 5,
    testObjArray: [testObject],
    testObject: { t: 1 },
    testSomeNullObject: {
      s: 1, t: null, x: undefined,
    },
    testString: 'hello there.  this is a pretty long string.  what do you think?',
    testUndefined: undefined,
  }
  for (let i = 0; i < 256; i++) {
    bigObject.testObjArray.push(testObject)
  }
  beforeAll(async () => {
    await ObjectHasher.wasmInitialized
  })

  test('wasm vs js (performance-big-obj)', async () => {
    const objSize = JSON.stringify(bigObject).length
    const stringifyStart = Date.now()
    for (let x = 0; x < 100; x++) {
      JSON.stringify(bigObject)
    }
    const stringifyDuration = Date.now() - stringifyStart
    console.log(`stringifyDuration: ${stringifyDuration}`)
    console.log(`objSize: ${objSize}`)

    ObjectHasher.warnIfUsingJsHash = true
    ObjectHasher.wasmSupport.allowWasm = false
    ObjectHasher.allowSubtle = true
    const subtleHashStart = Date.now()
    const subtlePromises: Promise<string>[] = []
    for (let x = 0; x < 180; x++) {
      subtlePromises.push(ObjectHasher.hash(bigObject))
    }
    await Promise.all(subtlePromises)
    const subtleHashDuration = Date.now() - subtleHashStart
    console.log(`subtleHashDuration: ${subtleHashDuration} [${await ObjectHasher.hash(bigObject)}]`)

    ObjectHasher.warnIfUsingJsHash = false
    ObjectHasher.wasmSupport.allowWasm = false
    ObjectHasher.allowSubtle = false
    const jsHashStart = Date.now()
    const jsPromises: Promise<string>[] = []
    for (let x = 0; x < 180; x++) {
      jsPromises.push(ObjectHasher.hash(bigObject))
    }
    await Promise.all(jsPromises)
    const jsHashDuration = Date.now() - jsHashStart
    console.log(`jsHashDuration: ${jsHashDuration} [${await ObjectHasher.hash(bigObject)}]`)

    ObjectHasher.wasmSupport.allowWasm = true
    const wasmHashStart = Date.now()
    const wasmPromises: Promise<string>[] = []
    for (let x = 0; x < 180; x++) {
      wasmPromises.push(ObjectHasher.hash(bigObject))
    }
    await Promise.all(wasmPromises)
    const wasmHashDuration = Date.now() - wasmHashStart
    console.log(`wasmHashDuration: ${wasmHashDuration} [${await ObjectHasher.hash(bigObject)}]`)
    expect(stringifyDuration).toBeDefined()
    expect(wasmHashDuration).toBeDefined()
    expect(jsHashDuration).toBeDefined()
    console.log(
      `Wasm is ${jsHashDuration - wasmHashDuration}ms (${((1 - wasmHashDuration / jsHashDuration) * 100).toPrecision(
        2,
      )}%) faster [${wasmHashDuration}ms vs ${jsHashDuration}ms ]`,
    )
  })
})
