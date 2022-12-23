import { XyoDivinerDivineQuerySchema } from '@xyo-network/diviner-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'

import { IdentityDiviner } from './IdentityDiviner'

describe('DivinerWrapper', () => {
  describe('divine', () => {
    it('returns divined result', async () => {
      const schema = 'network.xyo.debug'
      const diviner = await IdentityDiviner.create()
      const sut = new DivinerWrapper(diviner)
      const payloads = [new XyoPayloadBuilder({ schema }).build()]
      const result = await sut.divine(payloads)
      expect(result).toBeArrayOfSize(payloads.length + 1)
      const [answer, query] = result
      expect(answer).toBeObject()
      expect(answer.schema).toBe(schema)
      expect(query).toBeObject()
      expect(query.schema).toBe(XyoDivinerDivineQuerySchema)
    })
  })
})
