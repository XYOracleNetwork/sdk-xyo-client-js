import { ExternalProvider, JsonRpcFetchFunc } from '@ethersproject/providers'
import { Auth, SDK } from '@infura/sdk'
import { NftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

export type ProviderType = ExternalProvider | JsonRpcFetchFunc

type IPFSType = {
  apiKeySecret: string | undefined
  projectId: string | undefined
}

type AuthOptions = {
  chainId: number | undefined
  ipfs?: IPFSType
  privateKey?: string | undefined
  projectId: string | undefined
  provider?: ProviderType
  rpcUrl?: string | undefined
  secretId: string | undefined
}

export const getNftsOwnedByAddress = async (address: string, chainId: number, privateKey?: string, provider?: ProviderType): Promise<NftInfo[]> => {
  // Create Auth object
  const opts: AuthOptions = {
    chainId,
    // ipfs: {
    //   apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
    //   projectId: process.env.INFURA_IPFS_PROJECT_ID,
    // },
    privateKey,
    projectId: process.env.INFURA_PROJECT_ID,
    provider,
    // rpcUrl: process.env.EVM_RPC_URL,
    secretId: process.env.INFURA_PROJECT_SECRET,
  }

  if (privateKey) opts.privateKey = privateKey
  if (provider) opts.provider = provider

  const auth = new Auth(opts)

  // Instantiate SDK
  const sdk = new SDK(auth)
  // TODO: Handle pagination
  const result = await sdk.api.getCollectionsByWallet({
    walletAddress: address,
  })
  const nfts = result.collections.map<NftInfo>((collection) => collection)
  return nfts
}
