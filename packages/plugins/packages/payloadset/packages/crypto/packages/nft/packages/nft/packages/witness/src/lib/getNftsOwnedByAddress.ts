import { Auth, SDK } from '@infura/sdk'
import { NftInfoFields, toTokenType } from '@xyo-network/crypto-nft-payload-plugin'

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
  maxNfts = 1000,
): Promise<NftInfoFields[]> => {
  const sdk = new SDK(new Auth({ chainId, privateKey, projectId: process.env.INFURA_PROJECT_ID, secretId: process.env.INFURA_PROJECT_SECRET }))
  const nfts: NftInfoFields[] = []
  let cursor: string | undefined = undefined
  do {
    const opts: PublicAddressOptions = { cursor, includeMetadata: true, publicAddress }
    const { cursor: nextCursor, pageSize, total, assets } = await sdk.api.getNFTs(opts)
    const batch: NftInfoFields[] = assets.slice(0, Math.min(pageSize, total - nfts.length)).map((asset) => {
      const { contract: address, type, ...rest } = asset
      const tokenType = toTokenType(type)
      return { address, chainId, tokenType, ...rest }
    })
    nfts.push(...batch)
    cursor = nextCursor
    if (nfts.length >= total || !cursor) break
  } while (nfts.length < maxNfts)
  return nfts
}
