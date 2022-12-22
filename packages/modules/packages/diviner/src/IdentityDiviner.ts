import { DivinerConfig, XyoDivinerConfigSchema, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner-model'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayloads } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AbstractDiviner } from './AbstractDiviner'

export class IdentityDiviner extends AbstractDiviner {
  static override configSchema = XyoDivinerConfigSchema
  static override targetSchema = 'network.xyo.test'

  static override async create(params?: ModuleParams<DivinerConfig>) {
    return (await super.create(params)) as IdentityDiviner
  }

  public override divine(payloads: XyoPayloads): Promisable<XyoPayloads> {
    return payloads
  }

  override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }
}
