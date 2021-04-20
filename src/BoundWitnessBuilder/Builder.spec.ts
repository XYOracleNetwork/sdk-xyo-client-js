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
  let builder = new Builder<TestPayload>()
  expect(builder).toBeDefined()
  builder = builder.witness('1234567890', null)
  expect(builder).toBeDefined()
  const payload = {
    _schema: 'network.xyo.test',
    _timestamp: 1618603439107,
    numberField: 1,
    objectField: {
      numberValue: 2,
      stringValue: 'yo',
    },
    stringField: 'there',
  }
  const payload2 = {
    numberField: 1,
    _schema: 'network.xyo.test',
    _timestamp: 1618603439107,
    objectField: {
      stringValue: 'yo',
      numberValue: 2,
    },
    stringField: 'there',
  }

  const knownHash = 'a4cb8ff16e9a0367b5a8dce2a8934f1fca89a786499d27944795ff06ab6c1536'

  const json = builder.build(payload)
  expect(json).toBeDefined()
  expect(json._hash).toEqual(knownHash)

  const json2 = builder.build(payload2)
  expect(json2).toBeDefined()
  expect(json2._hash).toEqual(knownHash)
})
