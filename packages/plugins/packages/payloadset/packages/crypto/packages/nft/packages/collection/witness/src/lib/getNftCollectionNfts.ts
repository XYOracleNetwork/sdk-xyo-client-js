import { AxiosJson } from '@xyo-network/axios'
import { NftInfo, NftMetadata, NftSchema, toTokenType } from '@xyo-network/crypto-nft-payload-plugin'
import { ERC721Enumerable__factory, ERC721URIStorage__factory, ERC1155Supply__factory } from '@xyo-network/open-zeppelin-typechain'

import { getNftCollectionMetadata } from './getNftCollectionMetadata'
import { getProviderFromEnv } from './getProvider'
import { nonEvaluableContractAddresses } from './nonEvaluableContractAddresses'

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

export const getNftCollectionNfts = async (
  /**
   * The address of the NFT contract to search for
   */
  contractAddress: string,
  /**
   * The chain ID (1 = Ethereum Mainnet, 4 = Rinkeby, etc.) of the chain to search for NFTs on
   */
  chainId: number,
  /**
   * The maximum number of NFTs to return. Configurable to prevent
   * large wallets from exhausting Infura API credits. Ideally a
   * multiple of 100 as that appears to be the default page size.
   */
  maxNfts = 100,
): Promise<NftInfo[]> => {
  if (nonEvaluableContractAddresses.includes(contractAddress.toUpperCase())) {
    throw new Error(`Unable to evaluate collection with contractAddress: ${contractAddress}`)
  }
  const axios = new AxiosJson({ timeout: 500 })
  const provider = getProviderFromEnv(chainId)
  const enumerable = ERC721Enumerable__factory.connect(contractAddress, provider)
  const storage = ERC721URIStorage__factory.connect(contractAddress, provider)
  const supply1155 = ERC1155Supply__factory.connect(contractAddress, provider)
  const result: NftInfo[] = []
  const { type: nftType } = await getNftCollectionMetadata(contractAddress, chainId)

  for (let i = 0; i < maxNfts; i++) {
    const tokenId = (await enumerable.tokenByIndex(i)).toHexString()
    const supply = nftType === toTokenType('ERC11155') ? (await supply1155.totalSupply(tokenId)).toHexString() : '0x01'
    const metaDataUri = await storage.tokenURI(tokenId)
    const checkedMetaDataUri = checkIpfsUrl(metaDataUri, ipfsGateway)
    let metadata: NftMetadata | undefined = undefined
    try {
      metadata = (await axios.get(checkedMetaDataUri)).data
    } catch (ex) {
      const error = ex as Error
      console.error(error.message)
    }

    const info: NftInfo = {
      address: contractAddress,
      chainId,
      metaDataUri,
      metadata,
      schema: NftSchema,
      supply,
      tokenId,
      type: nftType,
    }
    result.push(info)
  }
  return result
}
