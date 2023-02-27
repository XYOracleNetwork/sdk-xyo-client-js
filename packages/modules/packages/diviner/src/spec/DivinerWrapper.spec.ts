import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'

import { IdentityDiviner } from '../IdentityDiviner'

describe('DivinerWrapper', () => {
  describe('divine', () => {
    it('returns divined result', async () => {
      const schema = 'network.xyo.debug'
      const diviner = await IdentityDiviner.create()
      const sut = new DivinerWrapper(diviner)
      const payloads = [new XyoPayloadBuilder({ schema }).build()]
      const result = await sut.divine(payloads)
      expect(result).toBeArrayOfSize(payloads.length)
      const [answer] = result
      expect(answer).toBeObject()
      expect(answer.schema).toBe(schema)
    })
  })
})
