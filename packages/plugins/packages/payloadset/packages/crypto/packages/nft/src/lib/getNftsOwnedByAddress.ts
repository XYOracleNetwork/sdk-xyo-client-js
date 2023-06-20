import { Auth, SDK } from '@infura/sdk'
import { NftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

type GetCollectionsByWallet = {
  cursor?: string
  walletAddress: string
}

export const getNftsOwnedByAddress = async (walletAddress: string, chainId: number, privateKey: string, maxSearchDepth = 100): Promise<NftInfo[]> => {
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
  for (let searchDepth = 0; searchDepth < maxSearchDepth; searchDepth++) {
    const opts: GetCollectionsByWallet = { walletAddress }
    if (cursor) opts.cursor = cursor
    const result = await sdk.api.getCollectionsByWallet(opts)
    nfts.push(...result.collections.map<NftInfo>((collection) => collection))
    cursor = result.cursor
    if (!cursor || searchDepth > maxSearchDepth) break
  }
  return nfts
}
