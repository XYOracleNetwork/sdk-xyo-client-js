import { Auth, SDK } from '@infura/sdk'
import { NftCollectionInfo, NftCollectionInfoPayload, NftCollectionSchema } from '@xyo-network/crypto-nft-collection-payload-plugin'

import { nonEvaluableContractAddresses } from './nonEvaluableContractAddresses'

type ContractAddressOptions = {
  contractAddress: string
  cursor?: string
}

export const getNftCollectionInfo = async (
  /**
   * The address of the NFT contract to search for
   */
  contractAddress: string,
  /**
   * The chain ID (1 = Ethereum Mainnet, 4 = Rinkeby, etc.) of the chain to search for NFTs on
   */
  chainId: number,
  // /**
  //  * The ethers provider to use to search for NFTs
  //  */
  // provider: ExternalProvider | JsonRpcFetchFunc,
  /**
   * The private key of the wallet to use to search for NFTs
   */
  privateKey: string,
): Promise<Omit<NftCollectionInfo, 'total'>> => {
  if (nonEvaluableContractAddresses.includes(contractAddress.toUpperCase())) {
    throw new Error(`Unable to evaluate collection with contractAddress: ${contractAddress}`)
  }
  const sdk = new SDK(new Auth({ chainId, privateKey, projectId: process.env.INFURA_PROJECT_ID, secretId: process.env.INFURA_PROJECT_SECRET }))
  const opts: ContractAddressOptions = { contractAddress }
  const { name, symbol, tokenType } = await sdk.api.getContractMetadata(opts)
  return { address: contractAddress, chainId, name, symbol, tokenType }
}
