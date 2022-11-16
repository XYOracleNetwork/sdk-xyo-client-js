import { XyoEthereumGasEtherchainV1Schema, XyoEthereumGasEtherchainV2Schema } from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'
import { XyoEthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'

export const divineGas = (payloads: XyoPayloads): XyoPayload => {
  const etherChainV1 = payloads.filter((p) => p.schema === XyoEthereumGasEtherchainV1Schema)
  const etherChainV2 = payloads.filter((p) => p.schema === XyoEthereumGasEtherchainV2Schema)
  const etherscan = payloads.filter((p) => p.schema === XyoEthereumGasEtherscanSchema)
  throw new Error('Not Implemented')
}
