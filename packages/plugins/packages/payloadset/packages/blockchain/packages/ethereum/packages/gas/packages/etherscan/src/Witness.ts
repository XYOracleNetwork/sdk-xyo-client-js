import { assertEx } from '@xylabs/assert'
import { XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { TimestampWitness, WitnessParams } from '@xyo-network/witness'

import { XyoEthereumGasEtherscanWitnessConfig } from './Config'
import { getGasFromEtherscan } from './lib'
import { XyoEthereumGasEtherscanWitnessConfigSchema } from './Schema'

export class XyoEthereumGasEtherscanWitness extends TimestampWitness<WitnessParams<AnyConfigSchema<XyoEthereumGasEtherscanWitnessConfig>>> {
  static override configSchema = XyoEthereumGasEtherscanWitnessConfigSchema

  override async observe(): Promise<Payload[]> {
    const apiKey = assertEx(this.config?.apiKey, 'apiKey is required')
    const payload = new PayloadBuilder<XyoEthereumGasEtherscanPayload>({ schema: XyoEthereumGasEtherscanSchema })
      .fields(await getGasFromEtherscan(apiKey))
      .build()
    return super.observe([payload])
  }
}
