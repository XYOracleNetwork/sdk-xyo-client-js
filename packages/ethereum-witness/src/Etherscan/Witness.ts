import { XyoQueryWitness } from '@xyo-network/witnesses'

import { XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanQueryPayload } from './Payload'

export class XyoEtherscanEthereumGasWitness extends XyoQueryWitness<XyoEthereumGasEtherscanQueryPayload, XyoEthereumGasEtherscanPayload> {
  constructor(query: XyoEthereumGasEtherscanQueryPayload) {
    super({
      targetSchema: XyoEtherscanEthereumGasWitness.schema,
      ...query,
    })
  }

  override async observe(): Promise<XyoEthereumGasEtherscanPayload> {
    return await super.observe({
      timestamp: Date.now(),
    })
  }

  public static schema = 'network.xyo.blockchain.ethereum.gas.etherscan'
}
