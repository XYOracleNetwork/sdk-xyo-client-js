import { XyoQueryWitness } from '@xyo-network/witnesses'

import { getV2GasFromEtherchain } from './getV2GasFromEtherchain'
import { XyoEthereumGasEtherchainPayloadV2, XyoEthereumGasEtherchainQueryPayloadV2 } from './Payload'

export class XyoEtherchainEthereumGasWitnessV2 extends XyoQueryWitness<XyoEthereumGasEtherchainQueryPayloadV2, XyoEthereumGasEtherchainPayloadV2> {
  constructor(query: XyoEthereumGasEtherchainQueryPayloadV2) {
    super({
      targetSchema: XyoEtherchainEthereumGasWitnessV2.schema,
      ...query,
    })
  }

  override async observe(): Promise<XyoEthereumGasEtherchainPayloadV2> {
    const fields = await getV2GasFromEtherchain()
    return await super.observe({
      ...fields,
      timestamp: Date.now(),
    })
  }

  public static schema = 'network.xyo.blockchain.ethereum.gas.etherchain.v2'
}
