/* eslint-disable complexity */
/* eslint-disable max-statements */
import { BaseProvider } from '@ethersproject/providers'
import { AxiosJson } from '@xylabs/axios'
import { NftMetadata } from '@xyo-network/crypto-nft-payload-plugin'
import { ERC721URIStorage__factory, ERC1155URIStorage__factory } from '@xyo-network/open-zeppelin-typechain'
import { checkIpfsUrl } from '@xyo-network/witness-blockchain-abstract'
import parseDataUrl from 'parse-data-url'

import { isErc721, isErc1155 } from './tokenTypes'

const baseUrlAbi = [
  {
    inputs: [],
    name: 'baseUrl',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

const ipfsGateway = '5d7b6582.beta.decentralnetworkservices.com'

export const getNftMetadata = async (
  /**
   * The address of the NFT contract to search for
   */
  contractAddress: string,
  /**
   * The chain ID (1 = Ethereum Mainnet, 4 = Rinkeby, etc.) of the chain to search for NFTs on
   */
  provider: BaseProvider,
  /**
   * The maximum number of NFTs to return. Configurable to prevent
   * large wallets from exhausting Infura API credits. Ideally a
   * multiple of 100 as that appears to be the default page size.
   */
  tokenId: string,
  load = false,
  defaultUri?: string,
): Promise<[string | undefined, NftMetadata | undefined]> => {
  const storage721 = ERC721URIStorage__factory.connect(contractAddress, provider)
  const storage1155 = ERC1155URIStorage__factory.connect(contractAddress, provider)

  let uri721: string | undefined = undefined
  const is721 = await isErc721(provider, contractAddress)
  if (is721) {
    try {
      uri721 = await storage721.tokenURI(tokenId)
    } catch (ex) {
      //const error = ex as Error
      //console.error(`metaDataUri[${error.name}][${contractAddress}]: storage721.tokenURI(tokenId) failed`)
    }
  }

  /*let baseUrl: string | undefined = undefined
  if (is721) {
    try {
      const baseUrlContract = new Contract(contractAddress, baseUrlAbi, provider)
      baseUrl = await baseUrlContract.bareUrl()
    } catch (ex) {
      const error = ex as Error
      console.error(`baseUrl[${error.name}][${contractAddress}]: baseUrl() failed`)
    }
  }

  if (baseUrl && !uri721?.startsWith(baseUrl)) {
    uri721 = `${baseUrl}${uri721 ?? tokenId}`
  }
  */

  let uri1155: string | undefined = undefined
  if (!uri721) {
    const is1155 = await isErc1155(provider, contractAddress)
    if (is1155) {
      try {
        uri1155 = await storage1155.uri(tokenId)
      } catch (ex) {
        //const error = ex as Error
        //console.error(`metaDataUri[${error.name}][${contractAddress}]: storage1155.uri(tokenId) failed`)
        //console.log(error.message)
      }
    }
  }

  const tokenMetadataUri = uri721 || uri1155 || defaultUri
  let metadata: NftMetadata | undefined = undefined
  if (load) {
    if (tokenMetadataUri?.startsWith('data:')) {
      const parsedDataUrl = parseDataUrl(tokenMetadataUri)
      if (parsedDataUrl !== false && parsedDataUrl.contentType === 'application/json') {
        const buf = parsedDataUrl.toBuffer()
        const value = buf.toString('utf8')
        metadata = JSON.parse(value)
      }
    } else {
      let checkedMetaDataUri: string | undefined
      if (tokenMetadataUri && tokenMetadataUri.length > 5) {
        checkedMetaDataUri = tokenMetadataUri ? checkIpfsUrl(tokenMetadataUri, ipfsGateway) : tokenMetadataUri
      }
      try {
        const axios = new AxiosJson({ timeout: 5000 })
        metadata = checkedMetaDataUri ? (await axios.get(checkedMetaDataUri)).data : undefined
      } catch (ex) {
        //const error = ex as Error
        //console.error(`metadata: ${error.message}`)
      }
    }
  }

  return [tokenMetadataUri, metadata]
}
