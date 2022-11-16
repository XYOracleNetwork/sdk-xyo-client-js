import { XyoDiviner, XyoDivinerConfig, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { divinePrices } from './lib'
import { XyoEthereumGasPayload } from './Payload'
import { XyoEthereumGasDivinerConfigSchema, XyoEthereumGasSchema } from './Schema'

export class XyoEthereumGasDiviner extends XyoDiviner {
  static override configSchema = XyoEthereumGasDivinerConfigSchema
  static override targetSchema = XyoEthereumGasSchema

  static override async create(params?: XyoModuleParams<XyoDivinerConfig>) {
    return (await super.create(params)) as XyoEthereumGasDiviner
  }

  public override divine(payloads?: XyoPayloads): Promisable<XyoPayloads> {
    const cost = divinePrices()
    return [cost]
  }

  override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }
}
