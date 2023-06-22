import type { EtherscanProvider } from '@ethersproject/providers'
import { Transaction } from '@xyo-network/crypto-address-transaction-history-payload-plugin'

export const getTransactionsForAddress = async (
  /**
   * The address of the wallet to search for NFTs
   */
  publicAddress: string,
  /**
   * The ethers provider to use to search
   */
  provider: EtherscanProvider,
): Promise<Transaction[]> => {
  const history = await provider.getHistory(publicAddress)
  return history.map<Transaction>((transaction) => {
    const {
      gasLimit: rawGasLimit,
      gasPrice: rawGasPrice,
      maxFeePerGas: rawMaxFeePerGas,
      maxPriorityFeePerGas: rawMaxPriorityFeePerGas,
      value: rawValue,
    } = transaction
    const gasLimit = rawGasLimit?.toString()
    const gasPrice = rawGasPrice?.toString()
    const maxFeePerGas = rawMaxFeePerGas?.toString()
    const maxPriorityFeePerGas = rawMaxPriorityFeePerGas?.toString()
    const value = rawValue?.toString()
    return { ...transaction, gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas, value }
  })
}
