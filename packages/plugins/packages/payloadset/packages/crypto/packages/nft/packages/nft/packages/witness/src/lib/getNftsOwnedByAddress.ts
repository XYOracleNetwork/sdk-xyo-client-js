import { AbiCoder } from '@ethersproject/abi'
import { hexZeroPad } from '@ethersproject/bytes'
import { Log } from '@ethersproject/providers'
import { AxiosJson } from '@xyo-network/axios'
import { NftInfoFields, toTokenType } from '@xyo-network/crypto-nft-payload-plugin'
import { ERC721__factory, ERC1155__factory } from '@xyo-network/open-zeppelin-typechain'
import { utils } from 'ethers'

import { getInfuraProvider } from './getInfuraProvider'
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
  const nfts: NftInfoFields[] = []
  const provider = getProviderFromEnv()
  const currentBlock = await provider.getBlockNumber()
  const filterFrom = {
    fromBlock: currentBlock - 10000,
    toBlock: currentBlock,
    topics: [utils.id('Transfer(address,address,uint256)'), hexZeroPad(publicAddress, 32)],
  }

  // List all token transfers  *to*  myAddress:
  const filterTo = {
    fromBlock: currentBlock - 10000,
    toBlock: currentBlock,
    topics: [utils.id('Transfer(address,address,uint256)'), null, hexZeroPad(publicAddress, 32)],
  }

  const toLogs = await provider.getLogs(filterTo)
  const fromLogs = await provider.getLogs(filterFrom)

  const l: Log = toLogs[0]

  const typesArray = [
    { name: 'from', type: 'uint256' },
    { name: 'to', type: 'uint256' },
    { name: 'tokenId', type: 'uint256' },
  ]

  const abiCoder = new AbiCoder()
  const eventData = abiCoder.decode(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [{ name: 'from', type: 'uint256' } as any, { name: 'to', type: 'uint256' } as any, { name: 'tokenId', type: 'uint256' } as any],
    l.data,
  )

  return nfts
}
