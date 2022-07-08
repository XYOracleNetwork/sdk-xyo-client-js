import { XyoQueryWitness } from '@xyo-network/witnesses'

import { XyoEthereumGasEtherchainPayload, XyoEthereumGasEtherchainQueryPayload } from './Payload'

export class XyoEtherchainEthereumGasWitness extends XyoQueryWitness<XyoEthereumGasEtherchainQueryPayload, XyoEthereumGasEtherchainPayload> {
  constructor(query: XyoEthereumGasEtherchainQueryPayload) {
    super({
      targetSchema: XyoEtherchainEthereumGasWitness.schema,
      ...query,
    })
  }

  override async observe(): Promise<XyoEthereumGasEtherchainPayload> {
    return await super.observe({
      timestamp: Date.now(),
    })
  }

  public static schema = 'network.xyo.blockchain.ethereum.gas.etherchain'
}
