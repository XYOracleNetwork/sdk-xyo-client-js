import '@xylabs/vitest-extended'

import type { JsonPathTransformExpression } from '@xyo-network/diviner-jsonpath-model'
import { JsonPathDivinerConfigSchema } from '@xyo-network/diviner-jsonpath-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { type AnyPayload, asSchema } from '@xyo-network/payload-model'
import { HDWallet } from '@xyo-network/wallet'
import type { WalletInstance } from '@xyo-network/wallet-model'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { JsonPathDiviner } from '../Diviner.ts'
describe('JsonPathDiviner', () => {
  type TestData = [description: string, input: AnyPayload[], transformers: JsonPathTransformExpression[], expected: AnyPayload[]]
  const cases: TestData[] = [
    [
      'transforms single payload',
      [{ a: 0, schema: asSchema('network.xyo.test.source.a', true) }],
      [{ destinationField: 'c', sourcePathExpression: '$.a' }],
      [{ c: 0, schema: asSchema('network.xyo.test.destination', true) }],
    ],
    [
      'transforms multiple payloads',
      [
        { a: 0, schema: asSchema('network.xyo.test.source.a', true) },
        { b: 1, schema: asSchema('network.xyo.test.source.b', true) },
      ],
      [
        { destinationField: 'c', sourcePathExpression: '$.a' },
        { destinationField: 'd', sourcePathExpression: '$.b' },
      ],
      [
        { c: 0, schema: asSchema('network.xyo.test.destination', true) },
        { d: 1, schema: asSchema('network.xyo.test.destination', true) },
      ],
    ],
    [
      'transforms with default value if source property is missing',
      [{ schema: asSchema('network.xyo.test.source.a', true) }],
      [{
        defaultValue: 0, destinationField: 'c', sourcePathExpression: '$.a',
      }],
      [{ c: 0, schema: asSchema('network.xyo.test.destination', true) }],
    ],
    [
      'transforms with default value if source property is undefined',
      [{ schema: asSchema('network.xyo.test.source.a', true) }],
      [{
        defaultValue: 0, destinationField: 'c', sourcePathExpression: '$.a',
      }],
      [{ c: 0, schema: asSchema('network.xyo.test.destination', true) }],
    ],
    // TODO: Since this returns an array, it will not work with the current
    // implementation. Uncomment when arrayed transformer values are supported.
    // [
    //   'transforms array with * (all elements)',
    //   [{ a: [0, 1, 2], schema: 'network.xyo.test.source.a' }],
    //   [{ destinationField: 'c', sourcePathExpression: '$.a[*]' }],
    //   [{ c: 0, schema: 'network.xyo.test.destination' }],
    // ],
    [
      'transforms array (first position)',
      [{ a: [0, 1, 2], schema: asSchema('network.xyo.test.source.a', true) }],
      [{ destinationField: 'c', sourcePathExpression: '$.a[0]' }],
      [{ c: 0, schema: asSchema('network.xyo.test.destination', true) }],
    ],
    [
      'transforms array (Nth position)',
      [{ a: [0, 1, 2], schema: asSchema('network.xyo.test.source.a', true) }],
      [{ destinationField: 'c', sourcePathExpression: '$.a[1]' }],
      [{ c: 1, schema: asSchema('network.xyo.test.destination', true) }],
    ],
    [
      'transforms array (last position via subscript)',
      [{ a: [0, 1, 2], schema: asSchema('network.xyo.test.source.a', true) }],
      [{ destinationField: 'c', sourcePathExpression: '$.a[(@.length-1)]' }],
      [{ c: 2, schema: asSchema('network.xyo.test.destination', true) }],
    ],
    // Since this can return an array, it should stop passing when
    // the arrayed transformer values are supported.
    [
      'transforms array (last position via slice)',
      [{ a: [0, 1, 2], schema: asSchema('network.xyo.test.source.a', true) }],
      [{ destinationField: 'c', sourcePathExpression: '$.a[-1:]' }],
      [{ c: 2, schema: asSchema('network.xyo.test.destination', true) }],
    ],
    [
      'does not transform with default value if source property is null',
      [{ a: null, schema: asSchema('network.xyo.test.source.a', true) }],
      [{
        defaultValue: 0, destinationField: 'c', sourcePathExpression: '$.a',
      }],
      [{ c: null, schema: asSchema('network.xyo.test.destination', true) }],
    ],
    [
      'does not transform with default value if source property is false',
      [{ a: false, schema: asSchema('network.xyo.test.source.a', true) }],
      [{
        defaultValue: 0, destinationField: 'c', sourcePathExpression: '$.a',
      }],
      [{ c: false, schema: asSchema('network.xyo.test.destination', true) }],
    ],
    [
      'does not transform with default value if source property is falsy',
      [{ a: 0, schema: asSchema('network.xyo.test.source.a', true) }],
      [{
        defaultValue: 1, destinationField: 'c', sourcePathExpression: '$.a',
      }],
      [{ c: 0, schema: asSchema('network.xyo.test.destination', true) }],
    ],
  ]
  let wallet: WalletInstance
  beforeAll(async () => {
    wallet = await HDWallet.random()
  })
  it.each(cases)('%s', async (_title, inputs, transforms, outputs) => {
    const destinationSchema = outputs?.[0]?.schema
    const config = {
      destinationSchema,
      schema: JsonPathDivinerConfigSchema,
      transforms,
    }
    const sut = await JsonPathDiviner.create({ account: wallet, config })
    // Arrange
    const expected = await Promise.all(
      outputs.map(async (output, index) => {
        return { sources: [(await PayloadBuilder.dataHash(inputs[index]))], ...output }
      }),
    )

    // Act
    const actual = await sut.divine(inputs)

    // Assert
    expect(actual.map(i => PayloadBuilder.omitMeta(i))).toEqual(expected.map(i => PayloadBuilder.omitMeta(i)))
  })
})
