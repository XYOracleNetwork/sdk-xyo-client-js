import { Hasher } from '../Hasher'

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
  const bigObject = {
    testArray: [1, 2, 3],
    testBoolean: true,
    testNull: null,
    testNullObject: { t: null, x: undefined },
    testNumber: 5,
    testObjArray: [testObject, testObject, testObject, testObject, testObject, testObject, testObject, testObject, testObject],
    testObject: { t: 1 },
    testSomeNullObject: { s: 1, t: null, x: undefined },
    testString: 'hello there.  this is a pretty long string.  what do you think?',
    testUndefined: undefined,
  }
  beforeAll(async () => {
    await Hasher.wasmInitialized
  })
  test('wasm vs js (compatibility-sync)', () => {
    Hasher.wasmSupport.allowWasm = false
    const jsHash = new Hasher(testObject).hash
    Hasher.wasmSupport.allowWasm = true
    const wasmHash = new Hasher(testObject).hash
    expect(jsHash).toEqual(wasmHash)
  })

  test('wasm vs js (compatibility-async)', async () => {
    Hasher.wasmSupport.allowWasm = false
    const jsHash = await new Hasher(testObject).hashAsync()
    Hasher.wasmSupport.allowWasm = true
    const wasmHash = await new Hasher(testObject).hashAsync()
    expect(jsHash).toEqual(wasmHash)
  })

  test('wasm vs js (performance-serial)', async () => {
    Hasher.wasmSupport.allowWasm = false
    const jsHashStart = Date.now()
    for (let x = 0; x < 10000; x++) {
      await new Hasher({ ...testObject, nonce: x }).hashAsync()
    }
    const jsHashDuration = Date.now() - jsHashStart
    Hasher.wasmSupport.allowWasm = true
    const wasmHashStart = Date.now()
    for (let x = 0; x < 10000; x++) {
      await new Hasher({ ...testObject, nonce: x }).hashAsync()
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

  test('wasm vs js (performance-big-obj)', async () => {
    Hasher.wasmSupport.allowWasm = false
    const jsHashStart = Date.now()
    for (let x = 0; x < 10000; x++) {
      await new Hasher({ ...bigObject, nonce: x }).hashAsync()
    }
    const jsHashDuration = Date.now() - jsHashStart
    Hasher.wasmSupport.allowWasm = true
    const wasmHashStart = Date.now()
    for (let x = 0; x < 10000; x++) {
      await new Hasher({ ...bigObject, nonce: x }).hashAsync()
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
    Hasher.wasmSupport.allowWasm = false
    const jsTestObjects: Hasher[] = []
    for (let x = 0; x < 10000; x++) {
      jsTestObjects.push(new Hasher({ ...testObject, nonce: x }))
    }
    const jsHashStart = Date.now()
    await Promise.all(jsTestObjects.map((obj) => obj.hashAsync()))
    const jsHashDuration = Date.now() - jsHashStart
    Hasher.wasmSupport.allowWasm = true
    const wasmTestObjects: Hasher[] = []
    for (let x = 0; x < 10000; x++) {
      wasmTestObjects.push(new Hasher({ ...testObject, nonce: x }))
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
