import { BaseProvider } from '@ethersproject/providers'
import { AxiosJson } from '@xyo-network/axios'
import { NftInfo, NftMetadata, NftSchema, TokenType, toTokenType } from '@xyo-network/crypto-nft-payload-plugin'
import { ERC721Enumerable__factory, ERC721URIStorage__factory, ERC1155Supply__factory } from '@xyo-network/open-zeppelin-typechain'
import {
  checkIpfsUrl,
  ERC1967_PROXY_IMPLEMENTATION_STORAGE_SLOT,
  getErc1967Status,
  readAddressFromSlot,
} from '@xyo-network/witness-blockchain-abstract'

import { tokenTypes } from './tokenTypes'
import { tryCall } from './tryCall'

const ipfsGateway = '5d7b6582.beta.decentralnetworkservices.com'

export const getNftCollectionNfts = async (
  /**
   * The address of the NFT contract to search for
   */
  contractAddress: string,
  /**
   * The chain ID (1 = Ethereum Mainnet, 4 = Rinkeby, etc.) of the chain to search for NFTs on
   */
  provider: BaseProvider,
  types?: TokenType[],
  /**
   * The maximum number of NFTs to return. Configurable to prevent
   * large wallets from exhausting Infura API credits. Ideally a
   * multiple of 100 as that appears to be the default page size.
   */
  maxNfts = 100,
): Promise<NftInfo[]> => {
  try {
    //Check if ERC-1967 Upgradeable
    const { implementation } = await getErc1967Status(provider, contractAddress)

    const axios = new AxiosJson({ timeout: 2000 })
    const enumerable = ERC721Enumerable__factory.connect(implementation, provider)
    const storage = ERC721URIStorage__factory.connect(implementation, provider)
    const supply1155 = ERC1155Supply__factory.connect(implementation, provider)
    const finalTypes = types ?? (await tokenTypes(provider, implementation))
    const result: NftInfo[] = []

    for (let i = 0; i < maxNfts; i++) {
      const tokenId = await tryCall(async () => (await enumerable.tokenByIndex(i)).toHexString())
      if (tokenId !== undefined) {
        const supply = finalTypes.includes(toTokenType('ERC1155'))
          ? (await tryCall(async () => (await supply1155.totalSupply(tokenId)).toHexString())) ?? '0x01'
          : '0x01'
        const metadataUri = await tryCall(async () => await storage.tokenURI(tokenId))
        const checkedMetaDataUri = metadataUri ? checkIpfsUrl(metadataUri, ipfsGateway) : undefined
        let metadata: NftMetadata | undefined = undefined
        if (checkedMetaDataUri !== undefined) {
          try {
            metadata = (await axios.get(checkedMetaDataUri)).data
          } catch (ex) {
            const error = ex as Error
            console.error(`Get Metadata failed: ${error.message}`)
          }
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
          types: finalTypes,
        }
        if (implementation !== contractAddress) {
          info.implementation = implementation
        }
        result.push(info)
      }
    }
    return result
  } catch (ex) {
    const error = ex as Error
    console.error(`getNftCollectionNfts failed: [${error.name}] ${error.message}`)
    console.log(error.stack)
    return []
  }
}
