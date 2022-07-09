import { XyoQueryWitness } from '@xyo-network/witnesses'

import { getGasFromEtherscan } from './getGasFromEtherscan'
import { XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanQueryPayload } from './Payload'
import { transformGasFromEtherscan } from './transformGasFromEtherscan'

export class XyoEtherscanEthereumGasWitness extends XyoQueryWitness<XyoEthereumGasEtherscanQueryPayload, XyoEthereumGasEtherscanPayload> {
  constructor(query: XyoEthereumGasEtherscanQueryPayload) {
    super({
      targetSchema: XyoEtherscanEthereumGasWitness.schema,
      ...query,
    })
  }

  override async observe(): Promise<XyoEthereumGasEtherscanPayload> {
    const result = await getGasFromEtherscan()
    const transformed = transformGasFromEtherscan(result)
    return await super.observe({
      ...transformed,
      timestamp: Date.now(),
    })
  }

  public static schema = 'network.xyo.blockchain.ethereum.gas.etherscan'
}
