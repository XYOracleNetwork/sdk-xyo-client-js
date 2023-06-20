import { Auth, SDK } from '@infura/sdk'
import { NftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

type GetCollectionsByWallet = {
  cursor?: string
  walletAddress: string
}

export const getNftsOwnedByAddress = async (
  /**
   * The address of the wallet to search for NFTs
   */
  walletAddress: string,
  /**
   * The chain ID (1 = Ethereum Mainnet, 4 = Rinkeby, etc.) of the chain to search for NFTs on
   */
  chainId: number,
  /**
   * The private key of the wallet to use to search for NFTs
   */
  privateKey: string,
  /**
   * The maximum number of NFTs to return. Configurable to prevent
   * large wallets from exhausting Infura API credits.
   */
  maxNftCount = 1000,
): Promise<NftInfo[]> => {
  // Instantiate SDK
  const sdk = new SDK(
    new Auth({
      chainId,
      // ipfs: {
      //   apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
      //   projectId: process.env.INFURA_IPFS_PROJECT_ID,
      // },
      privateKey,
      projectId: process.env.INFURA_PROJECT_ID,
      // rpcUrl: process.env.EVM_RPC_URL,
      secretId: process.env.INFURA_PROJECT_SECRET,
    }),
  )
  const nfts: NftInfo[] = []
  let nextCursor: string | undefined = undefined
  let searchDepth = 0
  do {
    const opts: GetCollectionsByWallet = { walletAddress }
    if (nextCursor) opts.cursor = nextCursor
    const { collections, cursor, pageSize, total } = await sdk.api.getCollectionsByWallet(opts)
    const valid = Math.min(pageSize, total - nfts.length)
    nfts.push(...collections.slice(0, valid))
    nextCursor = cursor
    searchDepth += valid
    if (nfts.length >= total || !cursor) break
  } while (searchDepth < maxNftCount)
  return nfts
}
