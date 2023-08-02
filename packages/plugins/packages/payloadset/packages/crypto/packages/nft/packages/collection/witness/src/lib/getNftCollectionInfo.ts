import { Auth, SDK } from '@infura/sdk'
import { NftCollectionInfoPayload, NftCollectionSchema } from '@xyo-network/crypto-nft-collection-payload-plugin'

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
  /**
   * The maximum number of NFTs to return. Configurable to prevent
   * large wallets from exhausting Infura API credits.
   */
  maxNftCount = 1000,
): Promise<NftCollectionInfoPayload> => {
  // Instantiate SDK
  const sdk = new SDK(
    new Auth({
      chainId,
      privateKey,
      projectId: process.env.INFURA_PROJECT_ID,
      // ipfs: {
      //   apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
      //   projectId: process.env.INFURA_IPFS_PROJECT_ID,
      // },
      // provider,
      // NOTE: rpcUrl is not required if chainId & projectId are provided
      // rpcUrl: process.env.EVM_RPC_URL,
      secretId: process.env.INFURA_PROJECT_SECRET,
    }),
  )
  const opts: ContractAddressOptions = { contractAddress }
  const { name, symbol, tokenType } = await sdk.api.getContractMetadata(opts)
  return { address: contractAddress, chainId, name, schema: NftCollectionSchema, symbol, tokenType }
}
