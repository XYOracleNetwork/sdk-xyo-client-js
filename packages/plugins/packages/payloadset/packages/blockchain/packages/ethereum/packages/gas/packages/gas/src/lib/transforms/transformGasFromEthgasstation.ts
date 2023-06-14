/* eslint-disable sort-keys-fix/sort-keys-fix */
import { EthereumGasEthgasstationPayload } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { FeeData, FeePerGas, PriorityFeePerGas } from '@xyo-network/gas-price-payload-plugin'
import { linear } from 'regression'

const getBaseFee = (payload: EthereumGasEthgasstationPayload): number | undefined => {
  const { baseFee } = payload
  return baseFee
}

const getFeePerGas = (payload: EthereumGasEthgasstationPayload): Partial<FeePerGas> => {
  const { standard: medium, fast: high, instant: veryHigh } = payload.gasPrice
  const trend = linear([
    [1, medium],
    [2, high],
    [3, veryHigh],
  ])
  const low = trend.predict(0)[1]
  return { low, medium, high, veryHigh }
}

const getPriorityFeePerGas = (payload: EthereumGasEthgasstationPayload): Partial<PriorityFeePerGas> => {
  const { standard: medium, fast: high, instant: veryHigh } = payload.priorityFee
  const trend = linear([
    [1, medium],
    [2, high],
    [3, veryHigh],
  ])
  const low = trend.predict(0)[1]
  return { low, medium, high, veryHigh }
}

export const transformGasFromEthgasstation = (payload: EthereumGasEthgasstationPayload): FeeData => {
  const baseFee = getBaseFee(payload)
  const feePerGas = getFeePerGas(payload)
  const priorityFeePerGas = getPriorityFeePerGas(payload)
  return { baseFee, feePerGas, priorityFeePerGas }
}
