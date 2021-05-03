/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */
import { XyoAddress } from '../Address'
import { TestPayload } from '../Test'
import Builder from './Builder'

test('checking happy path', async () => {
  const payload1: TestPayload = {
    timestamp: 1618603439107,
    numberField: 1,
    objectField: {
      numberValue: 2,
      stringValue: 'yo',
    },
    stringField: 'there',
  }
  const payload2: TestPayload = {
    numberField: 1,
    timestamp: 1618603439107,
    objectField: {
      stringValue: 'yo',
      numberValue: 2,
    },
    stringField: 'there',
  }

  const knownHash = '3fa861ec1f11e3401f2811b65b60dfe409af27e900e2fb6727b46cba477670cb'

  const address = await XyoAddress.fromPhrase('test')

  let builder1 = new Builder()
  expect(builder1).toBeDefined()
  builder1 = builder1.witness(address, null)
  expect(builder1).toBeDefined()

  builder1 = builder1.payload('network.xyo.test', payload1)
  expect(builder1).toBeDefined()
  const json1 = builder1.build()
  expect(json1).toBeDefined()
  expect(json1._hash).toEqual(knownHash)

  let builder2 = new Builder()
  expect(builder2).toBeDefined()
  builder2 = builder2.witness(address, null)
  expect(builder2).toBeDefined()

  builder2 = builder2.payload('network.xyo.test', payload2)
  expect(builder2).toBeDefined()
  const json2 = builder2.build()
  expect(json2).toBeDefined()
  expect(json2._hash).toEqual(knownHash)
})
