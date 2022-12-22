import { assertEx } from '@xylabs/assert'
import { XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayload } from '@xyo-network/payload-model'
import { TimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherscanWitnessConfig } from './Config'
import { getGasFromEtherscan } from './lib'
import { XyoEthereumGasEtherscanWitnessConfigSchema } from './Schema'

export class XyoEthereumGasEtherscanWitness extends TimestampWitness<XyoEthereumGasEtherscanWitnessConfig> {
  static override configSchema = XyoEthereumGasEtherscanWitnessConfigSchema

  static override async create(params?: ModuleParams<XyoEthereumGasEtherscanWitnessConfig>): Promise<XyoEthereumGasEtherscanWitness> {
    assertEx(params?.config?.apiKey, 'apiKey is required')
    return (await super.create(params)) as XyoEthereumGasEtherscanWitness
  }

  override async observe(): Promise<XyoPayload[]> {
    const apiKey = assertEx(this.config?.apiKey, 'apiKey is required')
    const payload = new XyoPayloadBuilder<XyoEthereumGasEtherscanPayload>({ schema: XyoEthereumGasEtherscanSchema })
      .fields(await getGasFromEtherscan(apiKey))
      .build()
    return super.observe([payload])
  }
}
