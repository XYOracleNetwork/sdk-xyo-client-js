import { XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'

export const sampleEtherscanGas: XyoEthereumGasEtherscanPayload = {
  message: 'OK',
  result: {
    FastGasPrice: '13',
    LastBlock: '15986476',
    ProposeGasPrice: '13',
    SafeGasPrice: '12',
    gasUsedRatio: '0.345005466666667,0.391415466666667,0.424558733333333,0.513428133333333,0.428615366666667',
    suggestBaseFee: '11.744544475',
  },
  schema: XyoEthereumGasEtherscanSchema,
  status: '1',
  timestamp: 1668648728013,
}
