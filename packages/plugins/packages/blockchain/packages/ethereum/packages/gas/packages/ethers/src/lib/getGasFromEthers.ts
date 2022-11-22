import { Provider } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'

import { EthereumGasEthersResponse } from '../Payload'

const convertToGwei = (value: { toString(): string }) => {
  return parseUnits(value.toString(), 'gwei').toNumber()
}

export const getGasFromEthers = async (provider: Provider): Promise<EthereumGasEthersResponse> => {
  // https://docs.ethers.io/v5/api/providers/provider/#Provider-getFeeData
  const feeData = await provider.getFeeData()
  const feeDataInGwei: EthereumGasEthersResponse = {
    gasPrice: feeData?.gasPrice ? convertToGwei(feeData.gasPrice) : null,
    lastBaseFeePerGas: feeData?.lastBaseFeePerGas ? convertToGwei(feeData.lastBaseFeePerGas) : null,
    maxFeePerGas: feeData?.maxFeePerGas ? convertToGwei(feeData.maxFeePerGas) : null,
    maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas ? convertToGwei(feeData.maxPriorityFeePerGas) : null,
  }
  return feeDataInGwei
}
