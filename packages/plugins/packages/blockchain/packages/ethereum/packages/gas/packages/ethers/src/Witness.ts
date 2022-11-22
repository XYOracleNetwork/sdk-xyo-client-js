import { Provider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEthersWitnessConfig } from './Config'
import { getGasFromEthers } from './lib'
import { XyoEthereumGasEthersPayload } from './Payload'
import { XyoEthereumGasEthersSchema, XyoEthereumGasEthersWitnessConfigSchema } from './Schema'

export interface XyoEthereumGasEthersWitnessParam extends XyoModuleParams<XyoEthereumGasEthersWitnessConfig> {
  provider: Provider
}

export class XyoEthereumGasEthersWitness extends XyoTimestampWitness<XyoEthereumGasEthersPayload, XyoEthereumGasEthersWitnessConfig> {
  static override configSchema = XyoEthereumGasEthersWitnessConfigSchema
  static override targetSchema = XyoEthereumGasEthersSchema
  protected provider?: Provider

  protected constructor(params: XyoEthereumGasEthersWitnessParam) {
    super(params)
    this.provider = params?.provider
  }

  static override async create(params?: XyoModuleParams<XyoEthereumGasEthersWitnessConfig>): Promise<XyoEthereumGasEthersWitness> {
    return (await super.create(params)) as XyoEthereumGasEthersWitness
  }

  override async observe(): Promise<XyoEthereumGasEthersPayload[]> {
    return super.observe([await getGasFromEthers(assertEx(this.provider, 'Provider Required'))])
  }
}
