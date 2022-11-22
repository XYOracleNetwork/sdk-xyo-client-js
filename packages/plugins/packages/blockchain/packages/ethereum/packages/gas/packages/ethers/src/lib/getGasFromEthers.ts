import { Provider } from '@ethersproject/providers'

import { EthereumGasEthersResponse } from '../Payload'

const formatFeeDataValue = (value: { toNumber(): number }) => {
  return value.toNumber()
}

export const getGasFromEthers = async (provider: Provider): Promise<EthereumGasEthersResponse> => {
  // https://docs.ethers.io/v5/api/providers/provider/#Provider-getFeeData
  const feeData = await provider.getFeeData()
  const formattedFeeData: EthereumGasEthersResponse = {
    gasPrice: feeData?.gasPrice ? formatFeeDataValue(feeData.gasPrice) : null,
    lastBaseFeePerGas: feeData?.lastBaseFeePerGas ? formatFeeDataValue(feeData.lastBaseFeePerGas) : null,
    maxFeePerGas: feeData?.maxFeePerGas ? formatFeeDataValue(feeData.maxFeePerGas) : null,
    maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas ? formatFeeDataValue(feeData.maxPriorityFeePerGas) : null,
  }
  return formattedFeeData
}
