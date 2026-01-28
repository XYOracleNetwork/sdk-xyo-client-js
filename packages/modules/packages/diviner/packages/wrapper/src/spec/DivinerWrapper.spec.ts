import '@xylabs/vitest-extended'

import { IdentityDiviner } from '@xyo-network/diviner-identity'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { asSchema } from '@xyo-network/payload-model'
import {
  describe, expect,
  it,
} from 'vitest'

/**
 * @group module
 * @group diviner
 */

describe('DivinerWrapper', () => {
  describe('divine', () => {
    it('returns divined result', async () => {
      const schema = asSchema('network.xyo.debug', true)
      const diviner = await IdentityDiviner.create({ account: 'random' })
      const payloads = [new PayloadBuilder({ schema }).build()]
      const result = await diviner.divine(payloads)
      expect(result).toBeArrayOfSize(payloads.length)
      const [answer] = result
      expect(answer).toBeObject()
      expect(answer.schema).toBe(schema)
    })
  })
})
