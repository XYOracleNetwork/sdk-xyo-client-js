import { PayloadHasher } from '../PayloadHasher'

const perfIterations = 10_000

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

  test('wasm vs js (performance-parallel)', async () => {
    PayloadHasher.allowSubtle = false
    PayloadHasher.wasmSupport.allowWasm = false
    const jsTestObjects: PayloadHasher[] = []
    for (let x = 0; x < perfIterations; x++) {
      jsTestObjects.push(new PayloadHasher({ ...testObject, nonce: x }))
    }
    const jsHashStart = Date.now()
    await Promise.all(jsTestObjects.map((obj) => obj.hash()))
    const jsHashDuration = Date.now() - jsHashStart
    PayloadHasher.allowSubtle = false
    PayloadHasher.wasmSupport.allowWasm = true
    const wasmTestObjects: PayloadHasher[] = []
    for (let x = 0; x < perfIterations; x++) {
      wasmTestObjects.push(new PayloadHasher({ ...testObject, nonce: x }))
    }
    const wasmHashStart = Date.now()
    await Promise.all(wasmTestObjects.map((obj) => obj.hash()))
    const wasmHashDuration = Date.now() - wasmHashStart
    expect(wasmHashDuration).toBeDefined()
    expect(jsHashDuration).toBeDefined()
    console.log(
      `Wasm (parallel) is ${jsHashDuration - wasmHashDuration}ms (${((1 - wasmHashDuration / jsHashDuration) * 100).toPrecision(
        2,
      )}%) faster than js [${wasmHashDuration}ms vs ${jsHashDuration}ms ]`,
    )
  })
})
