import { Interface } from '@ethersproject/abi'
import { JsonRpcProvider } from '@ethersproject/providers'
import { NftCollectionMetadata } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { ERC721Enumerable__factory, ERC1155__factory } from '@xyo-network/open-zeppelin-typechain'
import { constants } from 'ethers'

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
  provider: JsonRpcProvider,
): Promise<Omit<NftCollectionMetadata, 'total'>> => {
  try {
    const contract721 = ERC721Enumerable__factory.connect(contractAddress, provider)
    const contract1155 = ERC1155__factory.connect(contractAddress, provider)
    let name: string = ''
    try {
      name = await contract721.name()
    } catch (ex) {
      const error = ex as Error
      console.log(`name: ${error.message}`)
    }
    let symbol: string = ''
    try {
      symbol = await contract721.symbol()
    } catch (ex) {
      const error = ex as Error
      console.log(`symbol: ${error.message}`)
    }
    let is1155: boolean = false
    try {
      is1155 = await contract1155.supportsInterface(getInterfaceID(ERC1155__factory.getInterface(ERC1155__factory.abi)))
    } catch (ex) {
      const error = ex as Error
      console.log(`is1155: ${error.message}`)
      is1155 = false
    }
    return { address: contractAddress, chainId: provider.network.chainId, name, symbol, type: is1155 ? 'ERC1155' : 'ERC721' }
  } catch (ex) {
    const error = ex as Error
    console.error(`getNftCollectionMetadata: ${error.message}`)
    throw ex
  }
}
