import { Provider } from '@ethersproject/providers'
import { EthereumGasEthersResponse } from '@xyo-network/ethers-ethereum-gas-payload-plugin'

const formatFeeDataValue = (value: { toNumber(): number } | null): number | null => {
  return value ? value.toNumber() : null
}

export const getGasFromEthers = async (provider: Provider): Promise<EthereumGasEthersResponse> => {
  // https://docs.ethers.io/v5/api/providers/provider/#Provider-getFeeData
  const feeData = await provider.getFeeData()
  const formattedFeeData: EthereumGasEthersResponse = {
    gasPrice: formatFeeDataValue(feeData.gasPrice),
    lastBaseFeePerGas: formatFeeDataValue(feeData.lastBaseFeePerGas),
    maxFeePerGas: formatFeeDataValue(feeData.maxFeePerGas),
    maxPriorityFeePerGas: formatFeeDataValue(feeData.maxPriorityFeePerGas),
  }
  return formattedFeeData
}
