import { UniswapCryptoPair } from '@xyo-network/uniswap-crypto-market-payload-plugin'

export const getNftsOwnedByAddress = async (address: string, chain: string): Promise<UniswapCryptoPair[]> => {
  const nfts = await Promise.resolve([])
  // TODO: Implement
  return nfts
}
