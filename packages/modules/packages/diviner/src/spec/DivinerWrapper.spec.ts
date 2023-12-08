import { Account } from '@xyo-network/account'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { IdentityDiviner } from '../IdentityDiviner'

/**
 * @group module
 * @group diviner
 */

describe('DivinerWrapper', () => {
  describe('divine', () => {
    it('returns divined result', async () => {
      const schema = 'network.xyo.debug'
      const diviner = await IdentityDiviner.create({ account: Account.randomSync() })
      const payloads = [await new PayloadBuilder({ schema }).build()]
      const result = await diviner.divine(payloads)
      expect(result).toBeArrayOfSize(payloads.length)
      const [answer] = result
      expect(answer).toBeObject()
      expect(answer.schema).toBe(schema)
    })
  })
})
