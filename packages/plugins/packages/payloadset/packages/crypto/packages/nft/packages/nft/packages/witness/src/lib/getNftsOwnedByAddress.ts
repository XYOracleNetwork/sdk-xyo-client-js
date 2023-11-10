import { JsonRpcProvider, Provider, WebSocketProvider } from '@ethersproject/providers'
import { NftInfoFields, TokenType } from '@xyo-network/crypto-nft-payload-plugin'
import { ERC721__factory, ERC1155__factory, ERC1155Supply__factory } from '@xyo-network/open-zeppelin-typechain'
import { LRUCache } from 'lru-cache'

import { getAssetsFromWallet } from './getAssetsFromWallet'
import { getInfuraProvider } from './getInfuraProvider'
import { getNftMetadata } from './getNftMetadata'
import { tokenTypes } from './tokenTypes'
import { tryCall } from './tryCall'

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

const tokenTypeCache = new LRUCache<string, TokenType[]>({ max: 100 })

export const getTokenTypes = async (provider: Provider, address: string) => {
  const key = `${address}|${(await provider.getNetwork()).chainId}`
  const currentValue = tokenTypeCache.get(key)
  if (currentValue) {
    return currentValue
  } else {
    const types = await tokenTypes(provider, address)
    tokenTypeCache.set(key, types)
    return types
  }
}

export const getErc721MetadataUri = async (address: string, tokenId: string): Promise<[string | undefined, Error | undefined]> => {
  try {
    const contract = ERC721__factory.connect(address, getInfuraProvider())
    return [await contract.tokenURI(tokenId), undefined]
  } catch (ex) {
    return [undefined, ex as Error]
  }
}

export const getErc1155MetadataUri = async (address: string, tokenId: string): Promise<[string | undefined, Error | undefined]> => {
  try {
    const contract = ERC1155__factory.connect(address, getInfuraProvider())
    return [await contract.uri(tokenId), undefined]
  } catch (ex) {
    return [undefined, ex as Error]
  }
}

export const getNftMetadataUri = async (address: string, tokenId: string) => {
  const results = await Promise.all([getErc721MetadataUri(address, tokenId), getErc1155MetadataUri(address, tokenId)])
  return results[0][0] ?? results[1][0]
}

export const getNftsOwnedByAddressWithMetadata = async (
  /** @param publicAddress The address of the wallet to search for NFTs */
  publicAddress: string,
  /** @param provider The provider to use for accessing the block chain */
  provider: JsonRpcProvider | WebSocketProvider,
  /** @param maxNfts The maximum number of NFTs to return. Configurable to prevent large wallets from exhausting Infura API credits. */
  maxNfts = 1000,
  /** @param httpTimeout The connection timeout for http call to get metadata */
  timeout = 5000,
): Promise<NftInfoFields[]> => {
  const nfts = await getNftsOwnedByAddress(publicAddress, provider, maxNfts, timeout)
  const nftResult = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nfts.map(async (nft) => {
      try {
        if (!nft.metadataUri || !nft.metadata) {
          const [metadataUri, metadata] = await getNftMetadata(nft.address, provider, nft.tokenId)
          nft.metadata = metadata
          nft.metadataUri = metadataUri
        }
        return nft
      } catch (ex) {
        const error = ex as Error
        console.error(`Error: ${error.message}`)
        console.error(`${error.stack}`)
        throw ex
      }
    }),
  )
  return nftResult
}

export const getNftsOwnedByAddress = async (
  /** @param publicAddress The address of the wallet to search for NFTs */
  publicAddress: string,
  /** @param provider The provider to use for accessing the block chain */
  provider: JsonRpcProvider | WebSocketProvider,
  /** @param maxNfts The maximum number of NFTs to return. Configurable to prevent large wallets from exhausting Infura API credits. */
  maxNfts = 100,
  /** @param httpTimeout The connection timeout for http call to get metadata */
  timeout = 5000,
): Promise<NftInfoFields[]> => {
  const assets = await getAssetsFromWallet(publicAddress, maxNfts, timeout)

  const nftResult = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assets.map(async (nft) => {
      try {
        const { collectionAddress, collectionTokenId } = nft
        let supply = '0x01'
        const types = await getTokenTypes(provider, collectionAddress)
        if (types.includes('ERC1155')) {
          const supply1155 = ERC1155Supply__factory.connect(collectionAddress, provider)
          supply = (await tryCall(async () => (await supply1155.totalSupply(collectionTokenId)).toHexString())) ?? '0x01'
        }
        const fields: NftInfoFields = {
          address: collectionAddress,
          chainId: provider.network.chainId,
          supply,
          tokenId: collectionTokenId,
          type: types.at(0),
          types,
        }
        return fields
      } catch (ex) {
        const error = ex as Error
        console.error(`Error: ${error.message}`)
        console.error(`${error.stack}`)
        throw ex
      }
    }),
  )

  return nftResult
}
