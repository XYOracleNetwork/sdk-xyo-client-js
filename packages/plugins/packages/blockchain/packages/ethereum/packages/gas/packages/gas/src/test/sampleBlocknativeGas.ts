import {
  EstimatedBaseFee,
  XyoEthereumGasBlocknativePayload,
  XyoEthereumGasBlocknativeSchema,
} from '@xyo-network/blocknative-ethereum-gas-payload-plugin'

export const sampleBlocknativeGas: XyoEthereumGasBlocknativePayload = {
  blockPrices: [
    {
      baseFeePerGas: 13.691764456,
      blockNumber: 16028191,
      estimatedPrices: [
        {
          confidence: 99,
          maxFeePerGas: 22.04,
          maxPriorityFeePerGas: 1.09,
          price: 14,
        },
        {
          confidence: 95,
          maxFeePerGas: 21.58,
          maxPriorityFeePerGas: 0.63,
          price: 14,
        },
        {
          confidence: 90,
          maxFeePerGas: 21.25,
          maxPriorityFeePerGas: 0.3,
          price: 13,
        },
        {
          confidence: 80,
          maxFeePerGas: 21.16,
          maxPriorityFeePerGas: 0.21,
          price: 13,
        },
        {
          confidence: 70,
          maxFeePerGas: 21.12,
          maxPriorityFeePerGas: 0.17,
          price: 13,
        },
      ],
      estimatedTransactionCount: 69,
    },
  ],
  currentBlockNumber: 16028190,
  estimatedBaseFees: [
    {
      'pending+1': [
        {
          baseFee: 15.41,
          confidence: 99,
        },
      ],
    },
    {
      'pending+2': [
        {
          baseFee: 17.32,
          confidence: 99,
        },
      ],
    },
    {
      'pending+3': [
        {
          baseFee: 19.17,
          confidence: 99,
        },
      ],
    },
    {
      'pending+4': [
        {
          baseFee: 20.12,
          confidence: 99,
        },
      ],
    },
    {
      'pending+5': [
        {
          baseFee: 20.95,
          confidence: 99,
        },
      ],
    },
  ] as unknown as EstimatedBaseFee[],
  maxPrice: 36,
  msSinceLastBlock: 3643,
  network: 'main',
  schema: XyoEthereumGasBlocknativeSchema,
  system: 'ethereum',
  timestamp: 1668697958837,
  unit: 'gwei',
}
