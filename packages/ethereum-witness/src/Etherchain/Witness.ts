import { XyoQueryWitness } from '@xyo-network/witnesses'

import { getGasFromEtherchain } from './getGasFromEtherchain'
import { XyoEthereumGasEtherchainPayload, XyoEthereumGasEtherchainQueryPayload } from './Payload'

export class XyoEtherchainEthereumGasWitness extends XyoQueryWitness<XyoEthereumGasEtherchainQueryPayload, XyoEthereumGasEtherchainPayload> {
  constructor(query: XyoEthereumGasEtherchainQueryPayload) {
    super({
      targetSchema: XyoEtherchainEthereumGasWitness.schema,
      ...query,
    })
  }

  override async observe(): Promise<XyoEthereumGasEtherchainPayload> {
    const fields = await getGasFromEtherchain()
    return await super.observe({
      ...fields,
      timestamp: Date.now(),
    })
  }

  public static schema = 'network.xyo.blockchain.ethereum.gas.etherchain'
}
