import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DivinerConfig, DivinerModule, DivinerParams } from '@xyo-network/diviner'
import { EthereumGasSchema } from '@xyo-network/gas-price-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { divineGas } from './lib'
import { EthereumGasDivinerConfigSchema } from './Schema'

export type EthereumGasDivinerConfig = DivinerConfig<{ schema: EthereumGasDivinerConfigSchema }>
export type EthereumGasDivinerParams = DivinerParams<AnyConfigSchema<EthereumGasDivinerConfig>>

export class EthereumGasDiviner<TParams extends EthereumGasDivinerParams = EthereumGasDivinerParams>
  extends AbstractDiviner<TParams>
  implements DivinerModule
{
  static override configSchema: string = EthereumGasDivinerConfigSchema
  static override targetSchema: string = EthereumGasSchema

  override divine(payloads?: Payload[]): Promisable<Payload[]> {
    const cost = divineGas(payloads ?? [])
    return [cost]
  }
}
