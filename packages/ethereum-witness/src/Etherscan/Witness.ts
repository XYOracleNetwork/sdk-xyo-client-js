import { XyoQueryWitness } from '@xyo-network/witnesses'

import { EtherscanGasPriceResult, getGasFromEtherscan } from './getGasFromEtherscan'
import { XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanQueryPayload } from './Payload'

export class XyoEtherscanEthereumGasWitness extends XyoQueryWitness<XyoEthereumGasEtherscanQueryPayload, XyoEthereumGasEtherscanPayload> {
  constructor(query: XyoEthereumGasEtherscanQueryPayload) {
    super({
      targetSchema: XyoEtherscanEthereumGasWitness.schema,
      ...query,
    })
  }

  override async observe(): Promise<XyoEthereumGasEtherscanPayload> {
    const fields = await getGasFromEtherscan()
    // TODO: convert to numbers, etc.
    const converted = transformToNumerical(fields)
    return await super.observe({
      ...converted,
      timestamp: Date.now(),
    })
  }

  public static schema = 'network.xyo.blockchain.ethereum.gas.etherscan'
}

const transformToNumerical = (gas: EtherscanGasPriceResult): Partial<XyoEthereumGasEtherscanPayload> => {
  throw new Error('not implemented')
}
