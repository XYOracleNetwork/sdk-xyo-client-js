/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */
import { XyoAddress } from '../../Address'
import { TestPayload } from '../../Test'
import Builder from './Builder'

test('checking happy path', () => {
  const payload1: TestPayload = {
    number_field: 1,
    object_field: {
      number_value: 2,
      string_value: 'yo',
    },
    string_field: 'there',
    timestamp: 1618603439107,
  }
  const payload2: TestPayload = {
    number_field: 1,
    timestamp: 1618603439107,
    object_field: {
      string_value: 'yo',
      number_value: 2,
    },
    string_field: 'there',
  }

  const payload1Hash = Builder.hash(payload1)

  expect(payload1Hash).toEqual('13898b1fc7ef16c6eb8917b4bdd1aabbc1981069f035c51d4166a171273bfe3d')

  const knownHash = 'af0ba507a43ce9cde64afd7bca25b901745b8aa8aa99cac1d53f732638bf967d'

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
