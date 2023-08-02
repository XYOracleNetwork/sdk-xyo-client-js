import { Auth, SDK } from '@infura/sdk'
import { NftInfo, NftInfoPayload, NftSchema } from '@xyo-network/crypto-nft-payload-plugin'

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
   * large wallets from exhausting Infura API credits.
   */
  maxNftCount = 20000,
): Promise<NftInfoPayload[]> => {
  if (nonEvaluableContractAddresses.includes(contractAddress.toUpperCase())) {
    throw new Error(`Unable to evaluate collection with contractAddress: ${contractAddress}`)
  }
  const sdk = new SDK(new Auth({ chainId, privateKey, projectId: process.env.INFURA_PROJECT_ID, secretId: process.env.INFURA_PROJECT_SECRET }))
  const nfts: NftInfo[] = []
  let cursor: string | undefined = undefined
  do {
    const opts: ContractAddressOptions = { contractAddress, cursor }
    const { cursor: nextCursor, pageSize, total, assets } = await sdk.api.getNFTsForCollection(opts)
    const batch: NftInfo[] = assets.slice(0, Math.min(pageSize, total - nfts.length))
    nfts.push(...batch)
    cursor = nextCursor
    if (nfts.length >= total || !cursor) break
  } while (nfts.length < maxNftCount)
  return nfts.map((nft) => {
    return { ...nft, schema: NftSchema }
  })
}
