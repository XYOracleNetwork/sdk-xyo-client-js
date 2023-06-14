import { EthereumGasEtherchainV2Payload, EthereumGasEtherchainV2Schema } from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'

export const sampleEtherchainGasV2: EthereumGasEtherchainV2Payload = {
  code: 200,
  data: {
    fast: 19803047330,
    priceUSD: 1195.77,
    rapid: 29714286170,
    slow: 11200000000,
    standard: 12000000000,
    timestamp: 1668621234096,
  },
  schema: EthereumGasEtherchainV2Schema,
  timestamp: 1668621240790,
}
