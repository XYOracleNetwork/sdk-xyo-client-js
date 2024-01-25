import { HDWallet } from '@xyo-network/account'
import { JsonPathDivinerConfigSchema, JsonPathTransformExpression } from '@xyo-network/diviner-jsonpath-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { WalletInstance } from '@xyo-network/wallet-model'

import { JsonPathDiviner } from '../Diviner'
describe('JsonPathDiviner', () => {
  type AnyPayload = Payload<{ [key: string]: unknown }>
  type TestData = [description: string, input: AnyPayload[], transformers: JsonPathTransformExpression[], expected: AnyPayload[]]
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
      [
        { c: 0, schema: 'network.xyo.test.destination' },
        { d: 1, schema: 'network.xyo.test.destination' },
      ],
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
  let wallet: WalletInstance
  beforeAll(async () => {
    wallet = await HDWallet.random()
  })
  it.each(cases)('%s', async (_title, inputs, transforms, outputs) => {
    const destinationSchema = outputs?.[0]?.schema
    const config = await PayloadBuilder.build({
      destinationSchema,
      schema: JsonPathDivinerConfigSchema,
      transforms,
    })
    const sut = await JsonPathDiviner.create({ account: wallet, config })
    // Arrange
    const expected = await Promise.all(
      outputs.map(async (output, index) => {
        return await PayloadBuilder.build({ sources: [(await PayloadBuilder.build(inputs[index])).$hash], ...output })
      }),
    )

    // Act
    const actual = await sut.divine(await Promise.all(inputs.map((input) => PayloadBuilder.build(input))))

    // Assert
    expect(actual).toEqual(expected)
  })
})
