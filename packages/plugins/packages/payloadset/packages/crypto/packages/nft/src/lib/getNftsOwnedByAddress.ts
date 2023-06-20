import { Auth, SDK } from '@infura/sdk'
import { NftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

type PublicAddressOptions = {
  cursor?: string
  includeMetadata?: boolean
  publicAddress: string
  tokenAddresses?: string[]
}

export const getNftsOwnedByAddress = async (
  /**
   * The address of the wallet to search for NFTs
   */
  publicAddress: string,
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
  let cursor: string | undefined = undefined
  do {
    const opts: PublicAddressOptions = { cursor, includeMetadata: true, publicAddress }
    const { cursor: nextCursor, pageSize, total, assets } = await sdk.api.getNFTs(opts)
    const batch: NftInfo[] = assets.slice(0, Math.min(pageSize, total - nfts.length))
    nfts.push(...batch)
    cursor = nextCursor
    if (nfts.length >= total || !cursor) break
  } while (nfts.length < maxNftCount)
  return nfts
}
