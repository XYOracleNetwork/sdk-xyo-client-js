/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */
import { XyoAddress } from '../../Address'
import { XyoPayload } from '../../models'
import { XyoBoundWitnessBuilder } from './Builder'

test('checking happy path', () => {
  const payload1: XyoPayload = {
    schema: 'network.xyo.test',
    number_field: 1,
    object_field: {
      number_value: 2,
      string_value: 'yo',
    },
    string_field: 'there',
    timestamp: 1618603439107,
  }
  const payload2: XyoPayload = {
    schema: 'network.xyo.test',
    number_field: 1,
    timestamp: 1618603439107,
    object_field: {
      string_value: 'yo',
      number_value: 2,
    },
    string_field: 'there',
  }

  const payload1Hash = XyoBoundWitnessBuilder.hash(payload1)

  expect(payload1Hash).toEqual('c915c56dd93b5e0db509d1a63ca540cfb211e11f03039b05e19712267bb8b6db')

  const knownHash = '98e1a3a3483ae211e702ee9952f9cae335e571ab7c1de708edb97eacdd960ba1'

  const address = XyoAddress.fromPhrase('test')

  let builder1 = new XyoBoundWitnessBuilder()
  expect(builder1).toBeDefined()
  builder1 = builder1.witness(address, null)
  expect(builder1).toBeDefined()

  builder1 = builder1.payload('network.xyo.test', payload1)
  expect(builder1).toBeDefined()
  const json1 = builder1.build()
  expect(json1).toBeDefined()
  expect(json1._hash).toEqual(knownHash)

  let builder2 = new XyoBoundWitnessBuilder()
  expect(builder2).toBeDefined()
  builder2 = builder2.witness(address, null)
  expect(builder2).toBeDefined()

  builder2 = builder2.payload('network.xyo.test', payload2)
  expect(builder2).toBeDefined()
  const json2 = builder2.build()
  expect(json2).toBeDefined()
  expect(json2._hash).toEqual(knownHash)
})
