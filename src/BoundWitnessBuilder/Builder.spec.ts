/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */
import { XyoPayloadMeta } from '../models'
import Builder from './Builder'

interface TestPayload extends XyoPayloadMeta {
  numberField: number
  objectField: {
    numberValue: number
    stringValue: string
  }
  stringField: string
}

test('checking happy path', () => {
  const payload1: TestPayload = {
    _schema: 'network.xyo.test',
    _timestamp: 1618603439107,
    numberField: 1,
    objectField: {
      numberValue: 2,
      stringValue: 'yo',
    },
    stringField: 'there',
  }
  const payload2: TestPayload = {
    numberField: 1,
    _schema: 'network.xyo.test',
    _timestamp: 1618603439107,
    objectField: {
      stringValue: 'yo',
      numberValue: 2,
    },
    stringField: 'there',
  }

  const knownHash = '0e155a518b75a0eb3dac42c3143a60dfa566b5c2f9d2d2983846410450cc5a6a'

  let builder1 = new Builder()
  expect(builder1).toBeDefined()
  builder1 = builder1.witness('1234567890', null)
  expect(builder1).toBeDefined()

  builder1 = builder1.payload(payload1)
  expect(builder1).toBeDefined()
  const json1 = builder1.build()
  expect(json1).toBeDefined()
  expect(json1._hash).toEqual(knownHash)

  let builder2 = new Builder()
  expect(builder2).toBeDefined()
  builder2 = builder2.witness('1234567890', null)
  expect(builder2).toBeDefined()

  builder2 = builder2.payload(payload2)
  expect(builder2).toBeDefined()
  const json2 = builder2.build()
  expect(json2).toBeDefined()
  expect(json2._hash).toEqual(knownHash)
})
