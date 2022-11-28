import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { AbstractDiviner } from './AbstractDiviner'
import { DivinerConfig, XyoDivinerConfigSchema } from './Config'
import { XyoDivinerDivineQuerySchema } from './Queries'

export class IdentityDiviner extends AbstractDiviner {
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
