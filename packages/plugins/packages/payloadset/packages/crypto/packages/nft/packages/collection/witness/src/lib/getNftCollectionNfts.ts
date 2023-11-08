import { JsonRpcProvider } from '@ethersproject/providers'
import { AxiosJson } from '@xyo-network/axios'
import { NftInfo, NftMetadata, NftSchema, TokenType, toTokenType } from '@xyo-network/crypto-nft-payload-plugin'
import { ERC721Enumerable__factory, ERC721URIStorage__factory, ERC1155Supply__factory } from '@xyo-network/open-zeppelin-typechain'

import { nonEvaluableContractAddresses } from './nonEvaluableContractAddresses'
import { tokenTypes } from './tokenTypes'

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
  provider: JsonRpcProvider,
  types?: TokenType[],
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
  const axios = new AxiosJson({ timeout: 2000 })
  const enumerable = ERC721Enumerable__factory.connect(contractAddress, provider)
  const storage = ERC721URIStorage__factory.connect(contractAddress, provider)
  const supply1155 = ERC1155Supply__factory.connect(contractAddress, provider)
  const finalTypes = types ?? (await tokenTypes(enumerable))
  const result: NftInfo[] = []

  for (let i = 0; i < maxNfts; i++) {
    console.log(`Getting Token [${i}]`)
    const tokenId = (await enumerable.tokenByIndex(i)).toHexString()
    const supply = finalTypes.includes(toTokenType('ERC1155')) ? (await supply1155.totalSupply(tokenId)).toHexString() : '0x01'
    const metadataUri = await storage.tokenURI(tokenId)
    const checkedMetaDataUri = checkIpfsUrl(metadataUri, ipfsGateway)
    let metadata: NftMetadata | undefined = undefined
    try {
      metadata = (await axios.get(checkedMetaDataUri)).data
    } catch (ex) {
      const error = ex as Error
      console.error(error.message)
    }

    const info: NftInfo = {
      address: contractAddress,
      chainId: provider.network.chainId,
      metadata,
      metadataUri,
      schema: NftSchema,
      supply,
      tokenId,
      type: finalTypes.at(0),
      types,
    }
    result.push(info)
  }
  return result
}
