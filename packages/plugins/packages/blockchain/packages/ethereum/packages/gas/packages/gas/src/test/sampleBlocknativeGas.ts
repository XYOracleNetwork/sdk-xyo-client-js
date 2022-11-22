import {
  EstimatedBaseFee,
  XyoEthereumGasBlocknativePayload,
  XyoEthereumGasBlocknativeSchema,
} from '@xyo-network/blocknative-ethereum-gas-payload-plugin'

export const sampleBlocknativeGas: XyoEthereumGasBlocknativePayload = {
  blockPrices: [
    {
      baseFeePerGas: 15.848298687,
      blockNumber: 16026117,
      estimatedPrices: [
        {
          confidence: 99,
          maxFeePerGas: 25.15,
          maxPriorityFeePerGas: 1.04,
          price: 16,
        },
        {
          confidence: 95,
          maxFeePerGas: 24.68,
          maxPriorityFeePerGas: 0.57,
          price: 16,
        },
        {
          confidence: 90,
          maxFeePerGas: 24.38,
          maxPriorityFeePerGas: 0.27,
          price: 16,
        },
        {
          confidence: 80,
          maxFeePerGas: 24.3,
          maxPriorityFeePerGas: 0.19,
          price: 16,
        },
        {
          confidence: 70,
          maxFeePerGas: 24.27,
          maxPriorityFeePerGas: 0.16,
          price: 16,
        },
      ],
      estimatedTransactionCount: 72,
    },
  ],
  currentBlockNumber: 16026116,
  estimatedBaseFees: [
    {
      'pending+1': [
        {
          baseFee: 17.83,
          confidence: 99,
        },
      ],
    },
    {
      'pending+2': [
        {
          baseFee: 20.06,
          confidence: 99,
        },
      ],
    },
    {
      'pending+3': [
        {
          baseFee: 22.12,
          confidence: 99,
        },
      ],
    },
    {
      'pending+4': [
        {
          baseFee: 23.6,
          confidence: 99,
        },
      ],
    },
    {
      'pending+5': [
        {
          baseFee: 24.11,
          confidence: 99,
        },
      ],
    },
  ] as unknown as EstimatedBaseFee[],
  maxPrice: 100,
  msSinceLastBlock: 3204,
  network: 'main',
  schema: XyoEthereumGasBlocknativeSchema,
  system: 'ethereum',
  timestamp: 1668697958837,
  unit: 'gwei',
}
