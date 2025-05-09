import '@xylabs/vitest-extended'

import { delay } from '@xylabs/delay'
import type { AnyObject } from '@xylabs/object'
import {
  beforeAll,
  describe, expect, test,
} from 'vitest'

import { NodeObjectHasher as ObjectHasher } from '../NodeObjectHasher.ts'

const perfIterations = 1000

describe('Hasher', () => {
  const testObject = () => ({
    salt: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
  })

  beforeAll(async () => {
    await ObjectHasher.wasmInitialized
  })

  test('subtle vs wasm (performance-parallel)', async () => {
    const testObjects: AnyObject[] = []
    for (let x = 0; x < perfIterations; x++) {
      testObjects.push(testObject())
    }

    const subtleHashDuration = await (async () => {
      ObjectHasher.allowSubtle = true
      ObjectHasher.wasmSupport.allowWasm = false
      // prime it
      await Promise.all([{ length: 8 }].map(async (_, index) => await ObjectHasher.hash(testObjects[index])))
      const subtleHashStart = Date.now()
      const subtleResult = await Promise.all(testObjects.map(obj => ObjectHasher.hash(obj)))
      console.log(`subtleResult count: ${subtleResult.length}`)
      return Date.now() - subtleHashStart
    })()

    // allow for cleanup
    await delay(2000)

    const wasmHashDuration = await (async () => {
      ObjectHasher.allowSubtle = false
      ObjectHasher.wasmSupport.allowWasm = true
      // prime it
      await Promise.all([{ length: 8 }].map(async (_, index) => await ObjectHasher.hash(testObjects[index])))
      const wasmHashStart = Date.now()
      const wasmResult = await Promise.all(testObjects.map(obj => ObjectHasher.hash(obj)))
      console.log(`wasmResult count: ${wasmResult.length}`)
      return Date.now() - wasmHashStart
    })()

    expect(wasmHashDuration).toBeDefined()
    expect(subtleHashDuration).toBeDefined()
    console.log(
      `Subtle (parallel) is ${wasmHashDuration - subtleHashDuration}ms (${((1 - subtleHashDuration / wasmHashDuration) * 100).toPrecision(
        2,
      )}%) faster than Wasm [${subtleHashDuration}ms vs ${wasmHashDuration}ms ]`,
    )
    console.log(`Wasm Average: ${(wasmHashDuration / perfIterations).toPrecision(2)}ms`)
    console.log(`Subtle Average: ${(subtleHashDuration / perfIterations).toPrecision(2)}ms`)
  })
})
