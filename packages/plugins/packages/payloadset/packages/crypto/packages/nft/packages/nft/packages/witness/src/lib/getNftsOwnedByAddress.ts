import { Auth, SDK } from '@infura/sdk'
import { AxiosJson } from '@xyo-network/axios'
import { NftInfoFields, toTokenType } from '@xyo-network/crypto-nft-payload-plugin'
import { ERC721__factory, ERC1155__factory } from '@xyo-network/open-zeppelin-typechain'

import { getInfuraProvider } from './getInfuraProvider'

type PublicAddressOptions = {
  cursor?: string
  includeMetadata?: boolean
  publicAddress: string
  tokenAddresses?: string[]
}

const ipfsGateway = '5d7b6582.beta.decentralnetworkservices.com'

/**
 * Returns the equivalent IPFS gateway URL for the supplied URL.
 * @param urlToCheck The URL to check
 * @returns If the supplied URL is an IPFS URL, it converts the URL to the
 * equivalent IPFS gateway URL. Otherwise, returns the original URL.
 */
export const checkIpfsUrl = (urlToCheck: string, ipfsGateway: string) => {
  const url = new URL(urlToCheck)
  let protocol = url.protocol
  let host = url.host
  let path = url.pathname
  const query = url.search
  if (protocol === 'ipfs:') {
    protocol = 'https:'
    host = ipfsGateway
    path = url.host === 'ipfs' ? `ipfs${path}` : `ipfs/${url.host}${path}`
    const root = `${protocol}//${host}/${path}`
    return query?.length > 0 ? `${root}?${query}` : root
  } else {
    return urlToCheck
  }
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
  const axios = new AxiosJson()
  let cursor: string | undefined = undefined
  do {
    const opts: PublicAddressOptions = { cursor, includeMetadata: true, publicAddress }
    const { cursor: nextCursor, pageSize, total, assets } = await sdk.api.getNFTs(opts)
    const batch: NftInfoFields[] = assets.slice(0, Math.min(pageSize, total - nfts.length)).map((asset) => {
      const { contract: address, type: tokenType, ...rest } = asset
      const type = toTokenType(tokenType)
      return { address, chainId, type, ...rest }
    })
    nfts.push(...batch)
    cursor = nextCursor
    if (nfts.length >= total || !cursor) break
  } while (nfts.length < maxNfts)

  return await Promise.all(
    nfts.map(async (nft) => {
      let cookedUri: string | undefined = undefined
      try {
        const contract = ERC721__factory.connect(nft.address, getInfuraProvider())
        nft.metaDataUri = await contract.tokenURI(nft.tokenId)
        cookedUri = checkIpfsUrl(nft.metaDataUri, ipfsGateway)
      } catch (ex) {
        try {
          const contract = ERC1155__factory.connect(nft.address, getInfuraProvider())
          nft.metaDataUri = await contract.uri(nft.tokenId)
          cookedUri = checkIpfsUrl(nft.metaDataUri, ipfsGateway)
        } catch (ex) {
          console.log(`failed to get NTF metaDataUri [${ex}]`)
          return nft
        }
      }
      if (!cookedUri) {
        console.log(`failed to get NTF metadata [${cookedUri}]`)
        return nft
      }
      try {
        const metadata = (await axios.get(cookedUri))?.data
        return {
          ...nft,
          ...{ metadata },
        }
      } catch (ex) {
        console.log(`failed to get NTF metadata [${cookedUri}] [${ex}]`)
        return nft
      }
    }),
  )
}
