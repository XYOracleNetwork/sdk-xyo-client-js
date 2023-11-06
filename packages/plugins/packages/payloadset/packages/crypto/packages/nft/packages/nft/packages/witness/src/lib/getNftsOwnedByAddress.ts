import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { ApiGraphqlWitness, ApiGraphqlWitnessConfigSchema, GraphqlQuery, GraphqlQuerySchema, GraphqlResult } from '@xyo-network/api-graphql-plugin'
import { NftInfoFields, NftMetadata, toTokenType } from '@xyo-network/crypto-nft-payload-plugin'
import { AnyObject, JsonObject } from '@xyo-network/object'
import { ERC721__factory, ERC1155__factory, ERC1155Supply__factory } from '@xyo-network/open-zeppelin-typechain'

import { getInfuraProvider } from './getInfuraProvider'
import { getNftCollectionMetadata } from './getNftCollectionMetadata'
import { getNftMetadata } from './getNftMetadata'
import { getProviderFromEnv } from './getProvider'

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

interface QuickNodeNft {
  contractAddress: string
  externalUrl: string
  metadata: NftMetadata
  name: string
  tokenId: string
}

export const getNftsOwnedByAddress = async (
  /** @param publicAddress The address of the wallet to search for NFTs */
  publicAddress: string,
  /** @param chainId The chain ID (1 = Ethereum Mainnet, 4 = Rinkeby, etc.) of the chain to search for NFTs on */
  chainId: number,
  /** @param privateKey The private key of the wallet to use to search for NFTs */
  privateKey: string,
  /** @param maxNfts The maximum number of NFTs to return. Configurable to prevent large wallets from exhausting Infura API credits. */
  maxNfts = 1000,
  /** @param httpTimeout The connection timeout for http call to get metadata */
  timeout = 2000,
): Promise<NftInfoFields[]> => {
  const endpoint = 'https://api.quicknode.com/graphql'
  const witness = await ApiGraphqlWitness.create({
    account: Account.randomSync(),
    config: { schema: ApiGraphqlWitnessConfigSchema, timeout },
    endpoint,
  })
  const query: GraphqlQuery = {
    query: `query Query {
      ethereum {
        walletByAddress(address: "${publicAddress}") {
          walletNFTs (first: ${maxNfts}) {
            edges {
              node {
                nft {
                  contractAddress
                  metadata
                  tokenId
                  externalUrl
                  name
                }
              }
            }
          }
        }
      }
    }`,
    schema: GraphqlQuerySchema,
    variables: {},
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = (await witness.observe([query])) as GraphqlResult<any>[]
  const witnessResult = assertEx(results.at(0), 'ApiGraphqlWitness failed')
  const provider = getProviderFromEnv()

  const nftResult = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.values(witnessResult.result?.data?.ethereum?.walletByAddress?.walletNFTs?.edges ?? {}).map(async (nft: any) => {
      try {
        const { contractAddress, tokenId, metadata, externalUrl } = nft.node.nft as QuickNodeNft
        let supply = '0x01'
        let type = toTokenType('ERC721')
        try {
          const supply1155 = ERC1155Supply__factory.connect(contractAddress, provider)
          const { type: nftType } = await getNftCollectionMetadata(contractAddress, provider)
          type = nftType
          supply = nftType === toTokenType('ERC1155') ? (await supply1155.totalSupply(tokenId)).toHexString() : '0x01'
        } catch (ex) {
          const error = ex as Error
          console.error(`supply: ${error.message}`)
        }
        const fields: NftInfoFields = {
          address: contractAddress,
          chainId,
          metadata,
          metadataUri: externalUrl,
          supply,
          tokenId,
          type,
        }
        if (!fields.metadataUri || !fields.metadata) {
          const [metadataUri, metadata] = await getNftMetadata(contractAddress, provider, fields.tokenId)
          fields.metadata = metadata
          fields.metadataUri = metadataUri
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
