import { assertEx } from '@xylabs/assert'
import { PartialWitnessConfig, XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherscanWitnessConfig } from './Config'
import { getGasFromEtherscan } from './lib'
import { XyoEthereumGasEtherscanPayload } from './Payload'
import { XyoEthereumGasEtherscanSchema, XyoEthereumGasEtherscanWitnessConfigSchema } from './Schema'

export class XyoEtherscanEthereumGasWitness extends XyoTimestampWitness<XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanWitnessConfig> {
  constructor(config: PartialWitnessConfig<XyoEthereumGasEtherscanWitnessConfig>) {
    super({ schema: XyoEthereumGasEtherscanWitnessConfigSchema, targetSchema: XyoEthereumGasEtherscanSchema, ...config })
  }

  override async observe(): Promise<XyoEthereumGasEtherscanPayload> {
    const result = (await getGasFromEtherscan(assertEx(this.config?.apiKey, 'apiKey is required'))).result
    return super.observe(result)
  }
}
