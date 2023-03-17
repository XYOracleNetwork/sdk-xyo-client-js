import { AbstractDiviner, DivinerConfig, DivinerModule, DivinerParams } from '@xyo-network/diviner'
import { XyoEthereumGasSchema } from '@xyo-network/gas-price-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
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

  override divine(payloads?: Payload[]): Promisable<Payload[]> {
    const cost = divineGas(payloads ?? [])
    return [cost]
  }
}
