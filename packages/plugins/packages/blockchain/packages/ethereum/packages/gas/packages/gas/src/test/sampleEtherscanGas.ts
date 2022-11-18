import { XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'

export const sampleEtherscanGas: XyoEthereumGasEtherscanPayload = {
  message: 'OK',
  result: {
    FastGasPrice: '30',
    LastBlock: '15990556',
    ProposeGasPrice: '29',
    SafeGasPrice: '28',
    gasUsedRatio: '0.416266666666667,0.5672862,0.540979033333333,0.342410966666667,0.389071233333333',
    suggestBaseFee: '27.616709247',
  },
  schema: XyoEthereumGasEtherscanSchema,
  status: '1',
  timestamp: 1668697958837,
}
