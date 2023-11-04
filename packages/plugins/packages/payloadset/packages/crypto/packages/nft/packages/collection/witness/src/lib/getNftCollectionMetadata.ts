import { Interface } from '@ethersproject/abi'
import { NftCollectionMetadata } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { ERC721Enumerable__factory, ERC1155__factory } from '@xyo-network/open-zeppelin-typechain'
import { constants } from 'ethers'

import { getProviderFromEnv } from './getProvider'
import { nonEvaluableContractAddresses } from './nonEvaluableContractAddresses'

export function getInterfaceID(contractInterface: Interface) {
  let interfaceID = constants.Zero
  const functions: string[] = Object.keys(contractInterface.functions)
  for (let i = 0; i < functions.length; i++) {
    interfaceID = interfaceID.xor(contractInterface.getSighash(functions[i]))
  }

  return interfaceID.toHexString()
}

export const getNftCollectionMetadata = async (
  /**
   * The address of the NFT contract to search for
   */
  contractAddress: string,
  /**
   * The chain ID (1 = Ethereum Mainnet, 4 = Rinkeby, etc.) of the chain to search for NFTs on
   */
  chainId: number,
): Promise<Omit<NftCollectionMetadata, 'total'>> => {
  if (nonEvaluableContractAddresses.includes(contractAddress.toUpperCase())) {
    throw new Error(`Unable to evaluate collection with contractAddress: ${contractAddress}`)
  }
  const provider = getProviderFromEnv(chainId)
  const contract721 = ERC721Enumerable__factory.connect(contractAddress, provider)
  const contract1155 = ERC1155__factory.connect(contractAddress, provider)
  const name = await contract721.name()
  const symbol = await contract721.symbol()
  const is1155 = await contract1155.supportsInterface(getInterfaceID(ERC1155__factory.getInterface(ERC1155__factory.abi)))
  return { address: contractAddress, chainId, name, symbol, type: is1155 ? 'ERC1155' : 'ERC721' }
}
