import { PayloadHasher } from '../PayloadHasher'

describe('Hasher', () => {
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

  beforeAll(async () => {
    await PayloadHasher.wasmInitialized
  })
  test('wasm vs js (compatibility-sync)', async () => {
    PayloadHasher.wasmSupport.allowWasm = false
    const jsHash = await PayloadHasher.hashAsync(testObject)
    PayloadHasher.wasmSupport.allowWasm = true
    const wasmHash = await PayloadHasher.hashAsync(testObject)
    expect(jsHash).toEqual(wasmHash)
  })

  test('wasm vs js (compatibility-async)', async () => {
    PayloadHasher.wasmSupport.allowWasm = false
    const jsHash = await PayloadHasher.hashAsync(testObject)
    PayloadHasher.wasmSupport.allowWasm = true
    const wasmHash = await PayloadHasher.hashAsync(testObject)
    expect(jsHash).toEqual(wasmHash)
  })

  test('wasm vs js (performance-serial)', async () => {
    PayloadHasher.wasmSupport.allowWasm = false
    const jsHashStart = Date.now()
    for (let x = 0; x < 10000; x++) {
      await PayloadHasher.hashAsync({ ...testObject, nonce: x })
    }
    const jsHashDuration = Date.now() - jsHashStart
    PayloadHasher.wasmSupport.allowWasm = true
    const wasmHashStart = Date.now()
    for (let x = 0; x < 10000; x++) {
      await PayloadHasher.hashAsync({ ...testObject, nonce: x })
    }
    const wasmHashDuration = Date.now() - wasmHashStart
    expect(wasmHashDuration).toBeDefined()
    expect(jsHashDuration).toBeDefined()
    console.log(
      `Wasm is ${jsHashDuration - wasmHashDuration}ms (${((1 - wasmHashDuration / jsHashDuration) * 100).toPrecision(
        2,
      )}%) faster [${wasmHashDuration}ms vs ${jsHashDuration}ms ]`,
    )
  })

  test('wasm vs js (performance-parallel)', async () => {
    PayloadHasher.wasmSupport.allowWasm = false
    const jsTestObjects: PayloadHasher[] = []
    for (let x = 0; x < 10000; x++) {
      jsTestObjects.push(new PayloadHasher({ ...testObject, nonce: x }))
    }
    const jsHashStart = Date.now()
    await Promise.all(jsTestObjects.map((obj) => obj.hashAsync()))
    const jsHashDuration = Date.now() - jsHashStart
    PayloadHasher.wasmSupport.allowWasm = true
    const wasmTestObjects: PayloadHasher[] = []
    for (let x = 0; x < 10000; x++) {
      wasmTestObjects.push(new PayloadHasher({ ...testObject, nonce: x }))
    }
    const wasmHashStart = Date.now()
    await Promise.all(wasmTestObjects.map((obj) => obj.hashAsync()))
    const wasmHashDuration = Date.now() - wasmHashStart
    expect(wasmHashDuration).toBeDefined()
    expect(jsHashDuration).toBeDefined()
    console.log(
      `Wasm is ${jsHashDuration - wasmHashDuration}ms (${((1 - wasmHashDuration / jsHashDuration) * 100).toPrecision(
        2,
      )}%) faster [${wasmHashDuration}ms vs ${jsHashDuration}ms ]`,
    )
  })
})
