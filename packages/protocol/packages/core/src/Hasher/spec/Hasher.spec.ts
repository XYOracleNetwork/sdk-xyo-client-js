import { Hasher } from '../Hasher'

describe('Hasher', () => {
  test('wasm vs js (compatibility-sync)', () => {
    const testObject = {
      testArray: [1, 2, 3],
      testBoolean: true,
      testNull: null,
      testNullObject: { t: null, x: undefined },
      testNumber: 5,
      testObject: { t: 1 },
      testSomeNullObject: { s: 1, t: null, x: undefined },
      testString: 'hi',
      testUndefined: undefined,
    }

    Hasher.allowWasm = false

    const jsHash = new Hasher(testObject).hash

    Hasher.allowWasm = true

    const wasmHash = new Hasher(testObject).hash

    expect(jsHash).toEqual(wasmHash)
  })

  test('wasm vs js (compatibility-async)', async () => {
    const testObject = {
      testArray: [1, 2, 3],
      testBoolean: true,
      testNull: null,
      testNullObject: { t: null, x: undefined },
      testNumber: 5,
      testObject: { t: 1 },
      testSomeNullObject: { s: 1, t: null, x: undefined },
      testString: 'hi',
      testUndefined: undefined,
    }

    Hasher.allowWasm = false

    const jsHash = await new Hasher(testObject).hashAsync()

    Hasher.allowWasm = true

    const wasmHash = await new Hasher(testObject).hashAsync()

    expect(jsHash).toEqual(wasmHash)
  })

  test('wasm vs js (performance-serial)', async () => {
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

    Hasher.allowWasm = false

    const jsHashStart = Date.now()
    for (let x = 0; x < 10000; x++) {
      await new Hasher({ ...testObject, nonce: x }).hashAsync()
    }
    const jsHashDuration = Date.now() - jsHashStart

    Hasher.allowWasm = true

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
    const subObject = {
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

    const testObject = {
      testArray: [1, 2, 3],
      testBoolean: true,
      testNull: null,
      testNullObject: { t: null, x: undefined },
      testNumber: 5,
      testObjArray: [subObject, subObject, subObject, subObject, subObject, subObject, subObject, subObject, subObject],
      testObject: { t: 1 },
      testSomeNullObject: { s: 1, t: null, x: undefined },
      testString: 'hello there.  this is a pretty long string.  what do you think?',
      testUndefined: undefined,
    }

    Hasher.allowWasm = false

    const jsHashStart = Date.now()
    for (let x = 0; x < 10000; x++) {
      await new Hasher({ ...testObject, nonce: x }).hashAsync()
    }
    const jsHashDuration = Date.now() - jsHashStart

    Hasher.allowWasm = true

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

  test('wasm vs js (performance-parallel)', async () => {
    const testObject = {
      testArray: [1, 2, 3],
      testBoolean: true,
      testNull: null,
      testNullObject: { t: null, x: undefined },
      testNumber: 5,
      testObject: { t: 1 },
      testSomeNullObject: { s: 1, t: null, x: undefined },
      testString: 'hi',
      testUndefined: undefined,
    }

    Hasher.allowWasm = false

    const jsTestObjects: Hasher[] = []

    for (let x = 0; x < 10000; x++) {
      jsTestObjects.push(new Hasher({ ...testObject, nonce: x }))
    }

    const jsHashStart = Date.now()
    await Promise.all(jsTestObjects.map((obj) => obj.hashAsync()))
    const jsHashDuration = Date.now() - jsHashStart

    Hasher.allowWasm = true

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
