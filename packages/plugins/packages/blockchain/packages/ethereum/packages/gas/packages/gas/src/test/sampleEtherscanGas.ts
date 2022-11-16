import { XyoEthereumGasEtherscanPayload } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'

export const sampleEtherscanGas: XyoEthereumGasEtherscanPayload = {
  FastGasPrice: '23',

  LastBlock: '15984153',

  ProposeGasPrice: '23',

  SafeGasPrice: '22',
  // gasUsedRatio: ['0.565460366666667', '0.341763466666667', '0.497366366666667', '0.238179066666667', '0.0892571333333333'],
  gasUsedRatio: '0.238179066666667',
  schema: 'network.xyo.blockchain.ethereum.gas.etherscan',
  suggestBaseFee: '21.085767318',
  timestamp: 1668620700875,
}
