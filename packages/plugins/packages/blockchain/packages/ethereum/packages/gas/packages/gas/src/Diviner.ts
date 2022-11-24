import { AbstractDiviner, DivinerConfig, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { divineGas } from './lib'
import { XyoEthereumGasDivinerConfigSchema, XyoEthereumGasSchema } from './Schema'

export class XyoEthereumGasDiviner extends AbstractDiviner {
  static override configSchema = XyoEthereumGasDivinerConfigSchema
  static override targetSchema = XyoEthereumGasSchema

  static override async create(params?: XyoModuleParams<DivinerConfig>) {
    return (await super.create(params)) as XyoEthereumGasDiviner
  }

  public override divine(payloads: XyoPayloads): Promisable<XyoPayloads> {
    const cost = divineGas(payloads)
    return [cost]
  }

  override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }
}
