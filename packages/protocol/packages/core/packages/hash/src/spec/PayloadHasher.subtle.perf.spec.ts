import { NodePayloadHasher as PayloadHasher } from '../NodePayloadHasher'

const perfIterations = 10_000

describe('Hasher - Subtle performance', () => {
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
  test('subtle vs js (performance-parallel)', async () => {
    PayloadHasher.warnIfUsingJsHash = false
    PayloadHasher.allowSubtle = false
    PayloadHasher.wasmSupport.allowWasm = false
    const jsTestObjects: PayloadHasher[] = []
    for (let x = 0; x < perfIterations; x++) {
      jsTestObjects.push(new PayloadHasher({ ...testObject, nonce: x }))
    }
    const jsHashStart = Date.now()
    await Promise.all(jsTestObjects.map((obj) => obj.hash()))
    const jsHashDuration = Date.now() - jsHashStart

    PayloadHasher.warnIfUsingJsHash = true
    PayloadHasher.allowSubtle = true
    PayloadHasher.wasmSupport.allowWasm = false
    const subtleTestObjects: PayloadHasher[] = []
    for (let x = 0; x < perfIterations; x++) {
      subtleTestObjects.push(new PayloadHasher({ ...testObject, nonce: x }))
    }
    const subtleHashStart = Date.now()
    await Promise.all(subtleTestObjects.map((obj) => obj.hash()))
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
