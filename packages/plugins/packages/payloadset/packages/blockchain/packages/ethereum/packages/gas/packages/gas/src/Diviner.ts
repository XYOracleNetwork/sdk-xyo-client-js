import { AbstractDiviner, DivinerConfig, DivinerModule, DivinerParams } from '@xyo-network/diviner'
import { XyoEthereumGasSchema } from '@xyo-network/gas-price-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { XyoPayloads } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { divineGas } from './lib'
import { XyoEthereumGasDivinerConfigSchema } from './Schema'

export type XyoEthereumGasDivinerConfig = DivinerConfig<{ schema: XyoEthereumGasDivinerConfigSchema }>
export type XyoEthereumGasDivinerParams = DivinerParams<AnyConfigSchema<XyoEthereumGasDivinerConfig>>

export class XyoEthereumGasDiviner<TParams extends XyoEthereumGasDivinerParams = XyoEthereumGasDivinerParams>
  extends AbstractDiviner<TParams>
  implements DivinerModule
{
  static override configSchema: string = XyoEthereumGasDivinerConfigSchema
  static override targetSchema: string = XyoEthereumGasSchema

  static override async create<TParams extends XyoEthereumGasDivinerParams>(params?: TParams) {
    return (await super.create(params)) as XyoEthereumGasDiviner<TParams>
  }

  override divine(payloads?: XyoPayloads): Promisable<XyoPayloads> {
    const cost = divineGas(payloads ?? [])
    return [cost]
  }
}
