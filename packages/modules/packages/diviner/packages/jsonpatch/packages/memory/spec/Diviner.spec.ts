import { HDWallet } from '@xyo-network/account'
import { JsonPatchDivinerConfig, JsonPatchDivinerConfigSchema } from '@xyo-network/diviner-jsonpatch-model'
import { Payload } from '@xyo-network/payload-model'

import { JsonPatchDiviner } from '../src'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TestData = Payload<any>

const cases: [string, JsonPatchDivinerConfig, TestData[], TestData[]][] = [
  [
    'Adds a value',
    {
      operations: [{ op: 'add', path: '/value', value: 'foo' }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [{ schema: 'network.xyo.test' }],
    [{ schema: 'network.xyo.test', value: 'foo' }],
  ],
  [
    'Removes a value',
    {
      operations: [{ op: 'remove', path: '/value' }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [{ schema: 'network.xyo.test', value: 'foo' }],
    [{ schema: 'network.xyo.test' }],
  ],
  [
    'Replaces a schema',
    {
      operations: [{ op: 'replace', path: '/schema', value: 'network.xyo.debug' }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [{ schema: 'network.xyo.test' }],
    [{ schema: 'network.xyo.debug' }],
  ],
  [
    'Replaces a value',
    {
      operations: [{ op: 'replace', path: '/value', value: 'bar' }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [{ schema: 'network.xyo.test', value: 'foo' }],
    [{ schema: 'network.xyo.test', value: 'bar' }],
  ],
  [
    'Filters by schema',
    {
      operations: [{ op: 'test', path: '/schema', value: 'network.xyo.test' }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [
      { schema: 'network.xyo.test', value: 'foo' },
      { schema: 'network.xyo.debug', value: 'bar' },
    ],
    [{ schema: 'network.xyo.test', value: 'foo' }],
  ],
  [
    'Filters by value',
    {
      operations: [{ op: 'test', path: '/value', value: 'foo' }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [
      { schema: 'network.xyo.test', value: 'foo' },
      { schema: 'network.xyo.test', value: 'bar' },
    ],
    [{ schema: 'network.xyo.test', value: 'foo' }],
  ],
]

/**
 * @group module
 * @group diviner
 */

describe('MemoryJsonPatchDiviner', () => {
  let wallet: HDWallet
  beforeAll(async () => {
    wallet = await HDWallet.random()
  })
  describe('divine', () => {
    describe('with single input', () => {
      it.each(cases)('%s', async (_title, config, input, expected) => {
        const sut = await JsonPatchDiviner.create({ config, wallet })
        const result = await sut.divine(input)
        expect(result).toBeArrayOfSize(1)
        expect(result).toEqual(expected)
      })
    })
  })
})
