import { PayloadHasher } from '@xyo-network/core'
import { JsonPathDivinerConfigSchema, JsonPathTransformExpression } from '@xyo-network/diviner-jsonpath-model'
import { Payload } from '@xyo-network/payload-model'

import { JsonPathDiviner } from '../Diviner'

describe('JsonPathDiviner', () => {
  type AnyPayload = Payload<{ [key: string]: unknown }>
  type TestData = [description: string, payloads: AnyPayload[], payloadTransformers: JsonPathTransformExpression[], output: AnyPayload[]]
  const cases: TestData[] = [
    [
      'transforms single payload',
      [{ a: 0, schema: 'network.xyo.test.source.a' }],
      [{ destinationField: 'c', sourcePathExpression: '$.a' }],
      [{ c: 0, schema: 'network.xyo.test.destination' }],
    ],
    [
      'transforms multiple payloads',
      [
        { a: 0, schema: 'network.xyo.test.source.a' },
        { b: 1, schema: 'network.xyo.test.source.b' },
      ],
      [
        { destinationField: 'c', sourcePathExpression: '$.a' },
        { destinationField: 'd', sourcePathExpression: '$.b' },
      ],
      [{ c: 0, d: 1, schema: 'network.xyo.test.destination' }],
    ],
    [
      'transforms with default value if source property is missing',
      [{ schema: 'network.xyo.test.source.a' }],
      [{ defaultValue: 0, destinationField: 'c', sourcePathExpression: '$.a' }],
      [{ c: 0, schema: 'network.xyo.test.destination' }],
    ],
    [
      'transforms with default value if source property is undefined',
      [{ a: undefined, schema: 'network.xyo.test.source.a' }],
      [{ defaultValue: 0, destinationField: 'c', sourcePathExpression: '$.a' }],
      [{ c: 0, schema: 'network.xyo.test.destination' }],
    ],
    [
      'does not transform with default value if source property is null',
      [{ a: null, schema: 'network.xyo.test.source.a' }],
      [{ defaultValue: 0, destinationField: 'c', sourcePathExpression: '$.a' }],
      [{ c: null, schema: 'network.xyo.test.destination' }],
    ],
    [
      'does not transform with default value if source property is false',
      [{ a: false, schema: 'network.xyo.test.source.a' }],
      [{ defaultValue: 0, destinationField: 'c', sourcePathExpression: '$.a' }],
      [{ c: false, schema: 'network.xyo.test.destination' }],
    ],
    [
      'does not transform with default value if source property is falsy',
      [{ a: 0, schema: 'network.xyo.test.source.a' }],
      [{ defaultValue: 1, destinationField: 'c', sourcePathExpression: '$.a' }],
      [{ c: 0, schema: 'network.xyo.test.destination' }],
    ],
  ]
  it.each(cases)('%s', async (_title, inputs, transforms, output) => {
    const destinationSchema = output?.[0]?.schema
    const config = {
      destinationSchema,
      schema: JsonPathDivinerConfigSchema,
      transforms,
    }
    const sut = await JsonPathDiviner.create({ config })
    // Arrange
    const expected = await Promise.all(
      output.map(async (p) => {
        const sources = Object.keys(await PayloadHasher.toMap(inputs))
        return { sources, ...output }
      }),
    )

    // Act
    const actual = await sut.divine(inputs)

    // Assert
    expect(actual).toEqual(expected)
  })
})
