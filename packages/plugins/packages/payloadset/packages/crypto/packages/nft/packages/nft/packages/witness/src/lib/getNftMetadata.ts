import { JsonRpcProvider } from '@ethersproject/providers'
import { AxiosJson } from '@xyo-network/axios'
import { NftMetadata } from '@xyo-network/crypto-nft-payload-plugin'
import { ERC721URIStorage__factory, ERC1155URIStorage__factory } from '@xyo-network/open-zeppelin-typechain'

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

export const getNftMetadata = async (
  /**
   * The address of the NFT contract to search for
   */
  contractAddress: string,
  /**
   * The chain ID (1 = Ethereum Mainnet, 4 = Rinkeby, etc.) of the chain to search for NFTs on
   */
  provider: JsonRpcProvider,
  /**
   * The maximum number of NFTs to return. Configurable to prevent
   * large wallets from exhausting Infura API credits. Ideally a
   * multiple of 100 as that appears to be the default page size.
   */
  tokenId: string,
): Promise<[string | undefined, NftMetadata | undefined]> => {
  const axios = new AxiosJson({ timeout: 2000 })
  const storage = ERC721URIStorage__factory.connect(contractAddress, provider)
  const storage1155 = ERC1155URIStorage__factory.connect(contractAddress, provider)

  let uri1155: string | undefined
  try {
    uri1155 = await storage1155.uri(tokenId)
  } catch (ex) {
    const error = ex as Error
    console.error(`metaDataUri: ${error.message}`)
  }

  let metadataUri: string | undefined
  try {
    metadataUri = await storage.tokenURI(tokenId)
  } catch (ex) {
    const error = ex as Error
    console.error(`metadataUri: ${error.message}`)
  }

  const tokenMetadataUri = metadataUri ?? uri1155

  const checkedMetaDataUri = tokenMetadataUri ? checkIpfsUrl(tokenMetadataUri, ipfsGateway) : tokenMetadataUri
  let metadata: NftMetadata | undefined = undefined
  try {
    metadata = checkedMetaDataUri ? (await axios.get(checkedMetaDataUri)).data : undefined
  } catch (ex) {
    const error = ex as Error
    console.error(`metadata: ${error.message}`)
  }

  return [tokenMetadataUri, metadata]
}
