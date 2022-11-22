/* eslint-disable sort-keys-fix/sort-keys-fix */
import { parseUnits } from '@ethersproject/units'
import { XyoEthereumGasBlocknativePayload } from '@xyo-network/blocknative-ethereum-gas-payload-plugin'
import { linear } from 'regression'

import { FeeData, FeePerGas, PriorityFeePerGas } from '../../Model'

const getBaseFee = (payload: XyoEthereumGasBlocknativePayload): number | undefined => {
  return payload?.blockPrices?.[0]?.baseFeePerGas
}

const getFeePerGas = (payload: XyoEthereumGasBlocknativePayload): Partial<FeePerGas> => {
  const trend = linear([
    [0, payload.blockPrices?.[0].estimatedPrices?.[0].price],
    [1, payload.blockPrices?.[0].estimatedPrices?.[1].price],
    [2, payload.blockPrices?.[0].estimatedPrices?.[2].price],
    [3, payload.blockPrices?.[0].estimatedPrices?.[3].price],
    [4, payload.blockPrices?.[0].estimatedPrices?.[4].price],
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
  const priorityFeePerGas: PriorityFeePerGas = {
    low: payload?.blockPrices?.[0]?.estimatedPrices?.[1].maxPriorityFeePerGas,
    medium: payload?.blockPrices?.[0]?.estimatedPrices?.[2].maxPriorityFeePerGas,
    high: payload?.blockPrices?.[0]?.estimatedPrices?.[3].maxPriorityFeePerGas,
    veryHigh: payload?.blockPrices?.[0]?.estimatedPrices?.[4].maxPriorityFeePerGas,
  }
  return priorityFeePerGas
}

export const transformGasFromBlocknative = (payload: XyoEthereumGasBlocknativePayload): FeeData => {
  const baseFee = getBaseFee(payload)
  const feePerGas = getFeePerGas(payload)
  const priorityFeePerGas = getPriorityFeePerGas(payload)
  return { baseFee, feePerGas, priorityFeePerGas }
}
