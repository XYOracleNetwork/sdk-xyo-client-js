import { assertEx } from '@xylabs/sdk-js'
import { XyoQueryWitness, XyoQueryWitnessConfig } from '@xyo-network/witnesses'

import { getGasFromEtherscan } from './getGasFromEtherscan'
import { XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanQueryPayload } from './Payload'
import { transformGasFromEtherscan } from './transformGasFromEtherscan'

export interface XyoEtherscanEthereumGasWitnessConfig extends XyoQueryWitnessConfig<XyoEthereumGasEtherscanQueryPayload> {
  apiKey: string
}

export class XyoEtherscanEthereumGasWitness extends XyoQueryWitness<XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanQueryPayload, XyoEtherscanEthereumGasWitnessConfig> {
  override async observe(): Promise<XyoEthereumGasEtherscanPayload> {
    const result = await getGasFromEtherscan(assertEx(this.config?.apiKey, 'apiKey is required'))
    const transformed = transformGasFromEtherscan(result)
    return await super.observe({
      ...transformed,
      timestamp: Date.now(),
    })
  }
}
