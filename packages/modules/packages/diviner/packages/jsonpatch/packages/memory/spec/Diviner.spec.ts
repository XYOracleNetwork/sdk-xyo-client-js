import { HDWallet } from '@xyo-network/account'
import { JsonPatchDivinerConfig, JsonPatchDivinerConfigSchema } from '@xyo-network/diviner-jsonpatch-model'
import { Payload } from '@xyo-network/payload-model'

import { JsonPatchDiviner } from '../src'

const cases: [JsonPatchDivinerConfig, Payload, Payload][] = [
  [
    {
      operations: [
        { op: 'test', path: '/schema', value: 'network.xyo.test' },
        // { oldValue: false, op: 'replace', path: '/~1foo', value: 'baz' },
      ],
      schema: JsonPatchDivinerConfigSchema,
    },
    { schema: 'network.xyo.test' },
    { schema: 'network.xyo.test' },
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
      it.each(cases)('should jsonpatch the input according to the jsonpatch', async (config, input, expected) => {
        const sut = await JsonPatchDiviner.create({ config, wallet })
        const result = await sut.divine([input])
        expect(result).toBeArrayOfSize(1)
        expect(result[0]).toEqual(expected)
      })
    })
  })
})
