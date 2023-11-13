import { BaseProvider } from '@ethersproject/providers'
import { AxiosJson } from '@xyo-network/axios'
import { NftMetadata } from '@xyo-network/crypto-nft-payload-plugin'
import { ERC721URIStorage__factory, ERC1155URIStorage__factory } from '@xyo-network/open-zeppelin-typechain'
import { checkIpfsUrl } from '@xyo-network/witness-blockchain-abstract'

import { isErc721, isErc1155 } from './tokenTypes'

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
  const axios = new AxiosJson({ timeout: 2000 })
  const storage721 = ERC721URIStorage__factory.connect(contractAddress, provider)
  const storage1155 = ERC1155URIStorage__factory.connect(contractAddress, provider)

  let uri721: string | undefined = undefined
  const is721 = await isErc721(provider, contractAddress)
  if (is721) {
    try {
      uri721 = await storage721.tokenURI(tokenId)
    } catch (ex) {
      const error = ex as Error
      console.error(`metaDataUri[${error.name}][${contractAddress}]: storage721.tokenURI(tokenId) failed`)
    }
  }

  let uri1155: string | undefined = undefined
  if (!uri721) {
    const is1155 = await isErc1155(provider, contractAddress)
    if (is1155) {
      try {
        uri1155 = await storage1155.uri(tokenId)
      } catch (ex) {
        const error = ex as Error
        console.error(`metaDataUri[${error.name}][${contractAddress}]: storage1155.uri(tokenId) failed`)
        //console.log(error.message)
      }
    }
  }

  const tokenMetadataUri = uri721 || uri1155 || defaultUri
  let metadata: NftMetadata | undefined = undefined
  if (load) {
    const checkedMetaDataUri = tokenMetadataUri ? checkIpfsUrl(tokenMetadataUri, ipfsGateway) : tokenMetadataUri
    try {
      metadata = checkedMetaDataUri ? (await axios.get(checkedMetaDataUri)).data : undefined
    } catch (ex) {
      //const error = ex as Error
      //console.error(`metadata: ${error.message}`)
    }
  }

  return [tokenMetadataUri, metadata]
}
