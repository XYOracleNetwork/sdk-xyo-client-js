import { Provider } from '@ethersproject/providers'
import { NftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

export const getNftsOwnedByAddress = async (address: string, network: string, chainId: string, provider: Provider): Promise<NftInfo[]> => {
  const nfts = await Promise.resolve([])
  // TODO: Implement
  return nfts
}
