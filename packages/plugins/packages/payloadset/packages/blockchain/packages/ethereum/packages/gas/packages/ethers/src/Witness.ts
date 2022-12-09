import { Provider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import { XyoEthereumGasEthersPayload, XyoEthereumGasEthersSchema } from '@xyo-network/ethers-ethereum-gas-payload-plugin'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayload, XyoPayloadBuilder } from '@xyo-network/payload'
import { TimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEthersWitnessConfig } from './Config'
import { getGasFromEthers } from './lib'
import { XyoEthereumGasEthersWitnessConfigSchema } from './Schema'

export interface XyoEthereumGasEthersWitnessParams extends XyoModuleParams<XyoEthereumGasEthersWitnessConfig> {
  provider: Provider
}

export class XyoEthereumGasEthersWitness extends TimestampWitness<XyoEthereumGasEthersWitnessConfig> {
  static override configSchema = XyoEthereumGasEthersWitnessConfigSchema

  protected provider?: Provider

  protected constructor(params: XyoEthereumGasEthersWitnessParams) {
    super(params)
    this.provider = params?.provider
  }

  static override async create(params?: XyoEthereumGasEthersWitnessParams): Promise<XyoEthereumGasEthersWitness> {
    return (await super.create(params)) as XyoEthereumGasEthersWitness
  }

  override async observe(): Promise<XyoPayload[]> {
    const payload = new XyoPayloadBuilder<XyoEthereumGasEthersPayload>({ schema: XyoEthereumGasEthersSchema })
      .fields(await getGasFromEthers(assertEx(this.provider, 'Provider Required')))
      .build()
    return super.observe([payload])
  }
}
