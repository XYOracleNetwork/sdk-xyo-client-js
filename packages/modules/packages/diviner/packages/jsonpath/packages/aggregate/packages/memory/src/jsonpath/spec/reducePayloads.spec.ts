import '@xylabs/vitest-extended'

import type { SchemaToJsonPathTransformExpressionsDictionary } from '@xyo-network/diviner-jsonpath-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { AnyPayload } from '@xyo-network/payload-model'
import {
  describe, expect, it,
} from 'vitest'

import { jsonPathToTransformersDictionary } from '../jsonPathToTransformersDictionary.ts'
import { reducePayloads } from '../reducePayloads.ts'

describe('transformPayloads', () => {
  type TestData = [
    description: string,
    payloads: AnyPayload[],
    payloadTransformers: SchemaToJsonPathTransformExpressionsDictionary,
    output: AnyPayload,
  ]
  const cases: TestData[] = [
    [
      'transforms single payload',
      [{ a: 0, schema: 'network.xyo.test.source.a' }],
      { 'network.xyo.test.source.a': [{ destinationField: 'c', sourcePathExpression: '$.a' }] },
      { c: 0, schema: 'network.xyo.test.destination' },
    ],
    [
      'transforms multiple payloads',
      [
        { a: 0, schema: 'network.xyo.test.source.a' },
        { b: 1, schema: 'network.xyo.test.source.b' },
      ],
      {
        'network.xyo.test.source.a': [{ destinationField: 'c', sourcePathExpression: '$.a' }],
        'network.xyo.test.source.b': [{ destinationField: 'd', sourcePathExpression: '$.b' }],
      },
      {
        c: 0, d: 1, schema: 'network.xyo.test.destination',
      },
    ],
    [
      'transforms with default value if source property is missing',
      [{ schema: 'network.xyo.test.source.a' }],
      {
        'network.xyo.test.source.a': [{
          defaultValue: 0, destinationField: 'c', sourcePathExpression: '$.a',
        }],
      },
      { c: 0, schema: 'network.xyo.test.destination' },
    ],
    [
      'does not transform with default value if source property is null',
      [{ a: null, schema: 'network.xyo.test.source.a' }],
      {
        'network.xyo.test.source.a': [{
          defaultValue: 0, destinationField: 'c', sourcePathExpression: '$.a',
        }],
      },
      { c: null, schema: 'network.xyo.test.destination' },
    ],
    [
      'does not transform with default value if source property is false',
      [{ a: false, schema: 'network.xyo.test.source.a' }],
      {
        'network.xyo.test.source.a': [{
          defaultValue: 0, destinationField: 'c', sourcePathExpression: '$.a',
        }],
      },
      { c: false, schema: 'network.xyo.test.destination' },
    ],
    [
      'does not transform with default value if source property is falsy',
      [{ a: 0, schema: 'network.xyo.test.source.a' }],
      {
        'network.xyo.test.source.a': [{
          defaultValue: 1, destinationField: 'c', sourcePathExpression: '$.a',
        }],
      },
      { c: 0, schema: 'network.xyo.test.destination' },
    ],
  ]
  it.each(cases)('%s', async (_title, inputs, schemaTransforms, output) => {
    const transforms = jsonPathToTransformersDictionary(schemaTransforms)
    const destinationSchema = output.schema
    const sources = await PayloadBuilder.dataHashes(inputs)
    const withSources = await reducePayloads(inputs, transforms, destinationSchema, false)
    const withoutSources = await reducePayloads(inputs, transforms, destinationSchema, true)
    // With sources
    expect(withSources).toEqual({ sources, ...output })
    // Without sources
    expect(withoutSources).toEqual({ ...output })
  })
})
