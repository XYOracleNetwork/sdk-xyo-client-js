import { assertEx } from '@xylabs/assert'
import { EthereumGasEtherscanPayload, EthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { TimestampWitness, WitnessParams } from '@xyo-network/witness'

import { EthereumGasEtherscanWitnessConfig } from './Config'
import { getGasFromEtherscan } from './lib'
import { EthereumGasEtherscanWitnessConfigSchema } from './Schema'

export class EthereumGasEtherscanWitness extends TimestampWitness<WitnessParams<AnyConfigSchema<EthereumGasEtherscanWitnessConfig>>> {
  static override configSchemas = [EthereumGasEtherscanWitnessConfigSchema]

  protected override async observeHandler(): Promise<Payload[]> {
    const apiKey = assertEx(this.config?.apiKey, 'apiKey is required')
    const payload = new PayloadBuilder<EthereumGasEtherscanPayload>({ schema: EthereumGasEtherscanSchema })
      .fields(await getGasFromEtherscan(apiKey))
      .build()
    return super.observe([payload])
  }
}
