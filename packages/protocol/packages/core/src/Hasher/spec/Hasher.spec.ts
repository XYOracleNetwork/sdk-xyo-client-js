import { Hasher } from '../Hasher'

describe('Hasher', () => {
  test('wasm vs js (compatibility)', () => {
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

    const jsSortedHashData = Hasher.sortedHashData(testObject)
    const jsHash = new Hasher(testObject).hash

    Hasher.allowWasm = true

    const wasmSortedHashData = Hasher.sortedHashData(testObject)
    const wasmHash = new Hasher(testObject).hash

    expect(jsSortedHashData.toString('hex')).toEqual(wasmSortedHashData.toString('hex'))
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

    await Hasher.initialize()

    Hasher.allowWasm = false

    const jsHashStart = Date.now()
    for (let x = 0; x < 10000; x++) {
      new Hasher({ ...testObject, nonce: x }).hash
    }
    const jsHashDuration = Date.now() - jsHashStart

    Hasher.allowWasm = true

    const wasmHashStart = Date.now()
    for (let x = 0; x < 10000; x++) {
      new Hasher({ ...testObject, nonce: x }).hash
    }
    const wasmHashDuration = Date.now() - wasmHashStart

    expect(wasmHashDuration).toBeDefined()
    expect(jsHashDuration).toBeDefined()

    console.log(`Wasm is ${jsHashDuration - wasmHashDuration}ms faster`)
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

    await Hasher.initialize()

    Hasher.allowWasm = false

    const jsTestObjects: Hasher[] = []

    for (let x = 0; x < 10000; x++) {
      jsTestObjects.push(new Hasher({ ...testObject, nonce: x }))
    }

    const jsHashStart = Date.now()
    await Promise.all(jsTestObjects.map((obj) => obj.hash))
    const jsHashDuration = Date.now() - jsHashStart

    Hasher.allowWasm = true

    const wasmTestObjects: Hasher[] = []

    for (let x = 0; x < 10000; x++) {
      wasmTestObjects.push(new Hasher({ ...testObject, nonce: x }))
    }

    const wasmHashStart = Date.now()
    await Promise.all(wasmTestObjects.map((obj) => obj.hash))
    const wasmHashDuration = Date.now() - wasmHashStart

    expect(wasmHashDuration).toBeDefined()
    expect(jsHashDuration).toBeDefined()

    console.log(`Wasm is ${jsHashDuration - wasmHashDuration}ms faster`)
  })
})
