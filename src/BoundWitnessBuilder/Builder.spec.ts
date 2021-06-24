/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */
import { XyoAddress } from '../Address'
import { TestPayload } from '../Test'
import Builder from './Builder'

test('checking happy path', () => {
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

  const knownHash = '4e441db6a77f2b6967e3d8fe2ef80e0dfe18b9ed1c8fc7cd62cea92045d9d8ae'

  const address = XyoAddress.fromPhrase('test')

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
