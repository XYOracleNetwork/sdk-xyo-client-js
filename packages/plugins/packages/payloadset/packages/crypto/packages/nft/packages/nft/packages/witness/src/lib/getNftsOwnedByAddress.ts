import { BaseProvider } from '@ethersproject/providers'
import { BigNumber as XyBigNumber } from '@xylabs/bignumber'
import { getErc1822Status } from '@xyo-network/blockchain-erc1822-witness'
import { getErc1967Status } from '@xyo-network/blockchain-erc1967-witness'
import { NftInfoFields, TokenType } from '@xyo-network/crypto-nft-payload-plugin'
import { ERC721__factory, ERC1155__factory, ERC1155Supply__factory } from '@xyo-network/open-zeppelin-typechain'
import { LRUCache } from 'lru-cache'

import { getNftsFromWalletFromOpenSea } from './getAssetsFromWalletFromOpenSea'
import { getNftMetadata } from './getNftMetadata'
import { getProvider } from './getProvider'
import { tokenTypes } from './tokenTypes'
import { tryCall } from './tryCall'

const tokenTypeCache = new LRUCache<string, TokenType[]>({ max: 100 })

const hexBytesOnlyOnly = (value: string) => {
  return value.startsWith('0x') ? value.substring(2) : value
}

const isHexZero = (value?: string) => {
  return value === undefined ? true : new XyBigNumber(hexBytesOnlyOnly(value), 'hex').eqn(0)
}

export const getTokenTypes = async (provider: BaseProvider, address: string) => {
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

export const getErc721MetadataUri = async (
  address: string,
  tokenId: string,
  provider: BaseProvider,
): Promise<[string | undefined, Error | undefined]> => {
  try {
    const contract = ERC721__factory.connect(address, provider)
    return [await contract.tokenURI(tokenId), undefined]
  } catch (ex) {
    return [undefined, ex as Error]
  }
}

export const getErc1155MetadataUri = async (
  address: string,
  tokenId: string,
  provider: BaseProvider,
): Promise<[string | undefined, Error | undefined]> => {
  try {
    const contract = ERC1155__factory.connect(address, provider)
    return [await contract.uri(tokenId), undefined]
  } catch (ex) {
    return [undefined, ex as Error]
  }
}

export const getNftMetadataUri = async (address: string, tokenId: string, provider: BaseProvider) => {
  const results = await Promise.all([getErc721MetadataUri(address, tokenId, provider), getErc1155MetadataUri(address, tokenId, provider)])
  return results[0][0] ?? results[1][0]
}

export const getNftsOwnedByAddressWithMetadata = async (
  /** @param publicAddress The address of the wallet to search for NFTs */
  publicAddress: string,
  /** @param provider The provider to use for accessing the block chain */
  providers: BaseProvider[],
  /** @param maxNfts The maximum number of NFTs to return. Configurable to prevent large wallets from exhausting Infura API credits. */
  maxNfts = 200,
  /** @param httpTimeout The connection timeout for http call to get metadata */
  timeout = 5000,
): Promise<NftInfoFields[]> => {
  const nfts = await getNftsOwnedByAddress(publicAddress, providers, maxNfts, timeout)
  const nftResult = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nfts.map(async (nft) => {
      try {
        if (!nft.metadataUri || !nft.metadata) {
          const [metadataUri, metadata] = await getNftMetadata(
            nft.implementation ?? nft.address,
            getProvider(providers),
            nft.tokenId,
            true,
            nft.metadataUri,
          )
          nft.metadata = nft.metadata ?? metadata
          nft.metadataUri = nft.metadataUri ?? metadataUri
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
  providers: BaseProvider[],
  /** @param maxNfts The maximum number of NFTs to return. Configurable to prevent large wallets from exhausting Infura API credits. */
  maxNfts = 100,
  /** @param httpTimeout The connection timeout for http call to get metadata */
  timeout = 5000,
): Promise<NftInfoFields[]> => {
  //const assets = await getAssetsFromWallet(publicAddress, maxNfts, timeout)
  const nfts = await getNftsFromWalletFromOpenSea(providers, publicAddress, maxNfts, timeout)

  const nftResult = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nfts.map(async (nft) => {
      try {
        const { contract, identifier } = nft
        const provider = getProvider(providers)

        const block = await provider.getBlockNumber()

        //Check if ERC-1967 Upgradeable
        const erc1967Status = await getErc1967Status(provider, contract, block)

        //Check if ERC-1822 Upgradeable
        const erc1822Status = await getErc1822Status(provider, contract, block)

        const implementation = isHexZero(erc1967Status.slots.implementation) ? erc1822Status.implementation : erc1967Status.implementation

        let supply = '0x01'
        const types = await getTokenTypes(provider, implementation)
        if (types.includes('ERC1155')) {
          const supply1155 = ERC1155Supply__factory.connect(implementation, getProvider(providers))
          supply = (await tryCall(async () => (await supply1155.totalSupply(erc1967Status.address)).toHexString())) ?? '0x01'
        }
        const fields: NftInfoFields = {
          address: contract,
          chainId: getProvider(providers).network.chainId,
          metadataUri: nft.metadata_url ?? undefined,
          supply,
          tokenId: identifier,
          type: types.at(0),
          types,
        }
        if (implementation !== contract) {
          fields.implementation = implementation
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
