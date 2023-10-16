import { PayloadHasher } from '../PayloadHasher'
/*
const cryptoTest = async () => {
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
    testObjArray: [testObject],
    testObject: { t: 1 },
    testSomeNullObject: { s: 1, t: null, x: undefined },
    testString: 'hello there.  this is a pretty long string.  what do you think?',
    testUndefined: undefined,
  }
  for (let i = 0; i < 10000; i++) {
    bigObject.testObjArray.push(testObject)
  }

  const objSize = JSON.stringify(bigObject).length
  console.log(`objSize: ${objSize}`)
  const stringifiedObj = JSON.stringify(bigObject)
  const enc = new TextEncoder()
  const b = enc.encode(stringifiedObj)
  const cryptoHashStart = Date.now()
  for (let x = 0; x < 100; x++) {
    await crypto.subtle.digest('SHA-256', b)
  }

  const toHexString = (bytes) => {
    return Array.from(bytes, (byte) => {
      return ('0' + (byte & 0xff).toString(16)).slice(-2)
    }).join('')
  }

  const cryptoHashDuration = Date.now() - cryptoHashStart
  const result = await crypto.subtle.digest('SHA-256', b)
  const dataview = new DataView(result)
  const array = new Uint8Array(32)
  for (let i = 0; i < dataview.byteLength; i++) {
    array[i] = dataview.getUint8(i)
  }
  console.log(`Result: ${toHexString(array)}`)
  console.log(`cryptoHashDuration: ${cryptoHashDuration}`)
}
*/

describe('Hasher - BigObject', () => {
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
    testObjArray: [testObject],
    testObject: { t: 1 },
    testSomeNullObject: { s: 1, t: null, x: undefined },
    testString: 'hello there.  this is a pretty long string.  what do you think?',
    testUndefined: undefined,
  }
  for (let i = 0; i < 10000; i++) {
    bigObject.testObjArray.push(testObject)
  }
  beforeAll(async () => {
    await PayloadHasher.wasmInitialized
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

    PayloadHasher.wasmSupport.allowWasm = false
    PayloadHasher.allowSubtle = true
    const subtleHashStart = Date.now()
    for (let x = 0; x < 100; x++) {
      await PayloadHasher.hashAsync(bigObject)
    }
    const subtleHashDuration = Date.now() - subtleHashStart
    console.log(`subtleHashDuration: ${subtleHashDuration} [${await PayloadHasher.hashAsync(bigObject)}]`)

    PayloadHasher.wasmSupport.allowWasm = false
    PayloadHasher.allowSubtle = false
    const jsHashStart = Date.now()
    for (let x = 0; x < 100; x++) {
      await PayloadHasher.hashAsync(bigObject)
    }
    const jsHashDuration = Date.now() - jsHashStart
    console.log(`jsHashDuration: ${jsHashDuration} [${await PayloadHasher.hashAsync(bigObject)}]`)

    PayloadHasher.wasmSupport.allowWasm = true
    const wasmHashStart = Date.now()
    for (let x = 0; x < 100; x++) {
      await PayloadHasher.hashAsync(bigObject)
    }
    const wasmHashDuration = Date.now() - wasmHashStart
    console.log(`wasmHashDuration: ${wasmHashDuration} [${await PayloadHasher.hashAsync(bigObject)}]`)
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
