import { assertEx } from '@xylabs/assert'
import { XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayload } from '@xyo-network/payload-model'
import { TimestampWitness, WitnessParams } from '@xyo-network/witness'

import { XyoEthereumGasEtherscanWitnessConfig } from './Config'
import { getGasFromEtherscan } from './lib'
import { XyoEthereumGasEtherscanWitnessConfigSchema } from './Schema'

export class XyoEthereumGasEtherscanWitness extends TimestampWitness<WitnessParams<XyoEthereumGasEtherscanWitnessConfig>> {
  static override configSchema = XyoEthereumGasEtherscanWitnessConfigSchema

  override async observe(): Promise<XyoPayload[]> {
    const apiKey = assertEx(this.config?.apiKey, 'apiKey is required')
    const payload = new XyoPayloadBuilder<XyoEthereumGasEtherscanPayload>({ schema: XyoEthereumGasEtherscanSchema })
      .fields(await getGasFromEtherscan(apiKey))
      .build()
    return super.observe([payload])
  }
}
