import { ERC721Enumerable__factory } from '@xyo-network/open-zeppelin-typechain'

import { getProviderFromEnv } from './getProvider'
import { nonEvaluableContractAddresses } from './nonEvaluableContractAddresses'

export const getNftCollectionCount = async (
  /**
   * The address of the NFT contract to search for
   */
  contractAddress: string,
  /**
   * The chain ID (1 = Ethereum Mainnet, 4 = Rinkeby, etc.) of the chain to search for NFTs on
   */
  chainId: number,
): Promise<number> => {
  if (nonEvaluableContractAddresses.includes(contractAddress.toUpperCase())) {
    throw new Error(`Unable to evaluate collection with contractAddress: ${contractAddress}`)
  }
  const provider = getProviderFromEnv(chainId)
  const contract = ERC721Enumerable__factory.connect(contractAddress, provider)
  return (await contract.totalSupply()).toNumber()
}
