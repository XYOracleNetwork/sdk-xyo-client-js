import { Auth, SDK } from '@infura/sdk'
import { NftInfo, NftInfoFields, NftSchema, toTokenType } from '@xyo-network/crypto-nft-payload-plugin'

import { nonEvaluableContractAddresses } from './nonEvaluableContractAddresses'

type ContractAddressOptions = {
  contractAddress: string
  cursor?: string
}

export const getNftCollectionNfts = async (
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
  /**
   * The maximum number of NFTs to return. Configurable to prevent
   * large wallets from exhausting Infura API credits. Ideally a
   * multiple of 100 as that appears to be the default page size.
   */
  maxNfts = 100,
): Promise<NftInfo[]> => {
  if (nonEvaluableContractAddresses.includes(contractAddress.toUpperCase())) {
    throw new Error(`Unable to evaluate collection with contractAddress: ${contractAddress}`)
  }
  const sdk = new SDK(new Auth({ chainId, privateKey, projectId: process.env.INFURA_PROJECT_ID, secretId: process.env.INFURA_PROJECT_SECRET }))
  const nfts: NftInfoFields[] = []
  let cursor: string | undefined = undefined
  do {
    const opts: ContractAddressOptions = { contractAddress, cursor }
    const { cursor: nextCursor, pageSize, total, assets } = await sdk.api.getNFTsForCollection(opts)
    const batch: NftInfoFields[] = assets.slice(0, Math.min(pageSize, total - nfts.length)).map((asset) => {
      const { contract: address, type, ...rest } = asset
      const tokenType = toTokenType(type)
      return { address, chainId, tokenType, ...rest }
    })
    nfts.push(...batch)
    cursor = nextCursor
    if (nfts.length >= total || !cursor) break
  } while (nfts.length < maxNfts)
  return nfts.map((nft) => {
    return { ...nft, schema: NftSchema }
  })
}
