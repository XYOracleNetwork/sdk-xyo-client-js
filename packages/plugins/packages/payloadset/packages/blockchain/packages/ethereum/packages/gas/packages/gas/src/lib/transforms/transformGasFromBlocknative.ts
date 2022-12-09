/* eslint-disable sort-keys-fix/sort-keys-fix */
import { XyoEthereumGasBlocknativePayload } from '@xyo-network/blocknative-ethereum-gas-payload-plugin'
import { FeeData, FeePerGas, PriorityFeePerGas } from '@xyo-network/gas-price-payload-plugin'
import { linear } from 'regression'

const getBaseFee = (payload: XyoEthereumGasBlocknativePayload): number | undefined => {
  return payload?.blockPrices?.[0]?.baseFeePerGas
}

const getFeePerGas = (payload: XyoEthereumGasBlocknativePayload): Partial<FeePerGas> => {
  const sorted = payload.blockPrices?.[0].estimatedPrices?.sort((a, b) => a.confidence - b.confidence)
  const trend = linear([
    [0, sorted?.[0].price],
    [1, sorted?.[1].price],
    [2, sorted?.[2].price],
    [3, sorted?.[3].price],
    [4, sorted?.[4].price],
  ])
  const feePerGas: FeePerGas = {
    low: trend.predict(0.5)[1],
    medium: trend.predict(1.5)[1],
    high: trend.predict(2.5)[1],
    veryHigh: trend.predict(3.5)[1],
  }
  return feePerGas
}

const getPriorityFeePerGas = (payload: XyoEthereumGasBlocknativePayload): Partial<PriorityFeePerGas> => {
  const sorted = payload.blockPrices?.[0].estimatedPrices?.sort((a, b) => a.confidence - b.confidence)
  const trend = linear([
    [0, sorted?.[0].maxPriorityFeePerGas],
    [1, sorted?.[1].maxPriorityFeePerGas],
    [2, sorted?.[2].maxPriorityFeePerGas],
    [3, sorted?.[3].maxPriorityFeePerGas],
    [4, sorted?.[4].maxPriorityFeePerGas],
  ])
  const priorityFeePerGas: PriorityFeePerGas = {
    low: trend.predict(0.5)[1],
    medium: trend.predict(1.5)[1],
    high: trend.predict(2.5)[1],
    veryHigh: trend.predict(3.5)[1],
  }
  return priorityFeePerGas
}

export const transformGasFromBlocknative = (payload: XyoEthereumGasBlocknativePayload): FeeData => {
  const baseFee = getBaseFee(payload)
  const feePerGas = getFeePerGas(payload)
  const priorityFeePerGas = getPriorityFeePerGas(payload)
  return { baseFee, feePerGas, priorityFeePerGas }
}
