import { XyoEthereumGasEthgasstationPayload, XyoEthereumGasEthgasstationSchema } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'

export const sampleEthgasstationGas: XyoEthereumGasEthgasstationPayload = {
  baseFee: 10,
  blockNumber: 16028883,
  blockTime: 11.88,
  gasPrice: {
    fast: 12,
    instant: 13,
    standard: 12,
  },
  nextBaseFee: 10,
  priorityFee: {
    fast: 2,
    instant: 2,
    standard: 2,
  },
  schema: XyoEthereumGasEthgasstationSchema,
  timestamp: 1668697958837,
}
