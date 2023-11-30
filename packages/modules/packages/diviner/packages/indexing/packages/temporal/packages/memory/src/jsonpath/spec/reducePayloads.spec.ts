import { PayloadHasher } from '@xyo-network/core'
import { SchemaToJsonPathTransformExpressionsDictionary } from '@xyo-network/diviner-temporal-indexing-model'
import { Payload } from '@xyo-network/payload-model'

import { jsonPathToTransformersDictionary } from '../jsonPathToTransformersDictionary'
import { reducePayloads } from '../reducePayloads'

describe('transformPayloads', () => {
  const cases: [Payload[], SchemaToJsonPathTransformExpressionsDictionary, string, Payload][] = [
    [[], {}, 'network.xyo.test.destination', { schema: 'network.xyo.test.destination' }],
  ]
  it.each(cases)('transforms payloads', async (inputs, schemaTransforms, destinationSchema, output) => {
    const transforms = jsonPathToTransformersDictionary(schemaTransforms)
    const actual = await reducePayloads(inputs, transforms, destinationSchema)
    // Calculate sources
    const sources = Object.keys(await PayloadHasher.toMap(inputs))
    const expected = { sources, ...output }
    expect(actual).toEqual(expected)
  })
})
