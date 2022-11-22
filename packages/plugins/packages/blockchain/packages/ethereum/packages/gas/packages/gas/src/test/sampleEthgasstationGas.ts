import { XyoEthereumGasEthgasstationPayload, XyoEthereumGasEthgasstationSchema } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'

export const sampleEthgasstationGas: XyoEthereumGasEthgasstationPayload = {
  baseFee: 14,
  blockNumber: 16026136,
  blockTime: 11.88,
  gasPrice: {
    fast: 23,
    instant: 24,
    standard: 19,
  },
  nextBaseFee: 14,
  priorityFee: {
    fast: 2,
    instant: 2,
    standard: 2,
  },
  schema: XyoEthereumGasEthgasstationSchema,
  timestamp: 1668697958837,
}
