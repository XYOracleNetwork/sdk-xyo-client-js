import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayloadBuilder, XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { AbstractDiviner } from './AbstractDiviner'
import { DivinerConfig, XyoDivinerConfigSchema } from './Config'
import { DivinerWrapper } from './DivinerWrapper'
import { XyoDivinerDivineQuerySchema } from './Queries'

class IdentityDiviner extends AbstractDiviner {
  static override configSchema = XyoDivinerConfigSchema
  static override targetSchema = 'network.xyo.test'

  static override async create(params?: XyoModuleParams<DivinerConfig>) {
    return (await super.create(params)) as IdentityDiviner
  }

  public override divine(payloads: XyoPayloads): Promisable<XyoPayloads> {
    return payloads
  }

  override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }
}

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
