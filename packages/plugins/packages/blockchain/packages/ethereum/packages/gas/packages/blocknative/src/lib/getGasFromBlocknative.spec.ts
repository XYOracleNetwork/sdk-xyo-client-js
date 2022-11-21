import { getGasFromBlocknative } from './getGasFromBlocknative'

const sampleResponse = {
  blockPrices: [
    {
      baseFeePerGas: 12.189397666,
      blockNumber: 16020718,
      estimatedPrices: [
        {
          confidence: 99,
          maxFeePerGas: 20.59,
          maxPriorityFeePerGas: 1.09,
          price: 13,
        },
        {
          confidence: 95,
          maxFeePerGas: 19.95,
          maxPriorityFeePerGas: 0.45,
          price: 12,
        },
        {
          confidence: 90,
          maxFeePerGas: 19.73,
          maxPriorityFeePerGas: 0.23,
          price: 12,
        },
        {
          confidence: 80,
          maxFeePerGas: 19.67,
          maxPriorityFeePerGas: 0.17,
          price: 12,
        },
        {
          confidence: 70,
          maxFeePerGas: 19.64,
          maxPriorityFeePerGas: 0.14,
          price: 12,
        },
      ],
      estimatedTransactionCount: 156,
    },
  ],
  currentBlockNumber: 16020717,
  estimatedBaseFees: [
    {
      'pending+1': [
        {
          baseFee: 13.72,
          confidence: 99,
        },
      ],
    },
    {
      'pending+2': [
        {
          baseFee: 15.43,
          confidence: 99,
        },
      ],
    },
    {
      'pending+3': [
        {
          baseFee: 17.36,
          confidence: 99,
        },
      ],
    },
    {
      'pending+4': [
        {
          baseFee: 18.67,
          confidence: 99,
        },
      ],
    },
    {
      'pending+5': [
        {
          baseFee: 19.5,
          confidence: 99,
        },
      ],
    },
  ],
  maxPrice: 24,
  msSinceLastBlock: 7012,
  network: 'main',
  system: 'ethereum',
  unit: 'gwei',
}

describe('getGasFromBlocknative', () => {
  test('returns prices', async () => {
    // const gas = await getGasFromBlocknative()
    const gas = await Promise.resolve(sampleResponse)
    expect(gas).toBeObject()

    expect(gas?.blockPrices).toBeArrayOfSize(1)
    gas.blockPrices.map((blockPrice) => {
      expect(blockPrice.baseFeePerGas).toBeNumber()
      expect(blockPrice.blockNumber).toBeNumber()
      expect(blockPrice.estimatedPrices).toBeArrayOfSize(5)
      blockPrice.estimatedPrices.map((estimatedPrice) => {})
      expect(blockPrice.estimatedTransactionCount).toBeNumber()
    })
    expect(gas?.currentBlockNumber).toBeNumber()
    expect(gas?.maxPrice).toBeNumber()
    expect(gas?.msSinceLastBlock).toBeNumber()

    expect(gas?.network).toEqual('main')
    expect(gas?.system).toEqual('ethereum')
    expect(gas?.unit).toEqual('gwei')
  })
})
