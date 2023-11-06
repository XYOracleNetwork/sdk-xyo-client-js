import { Contract } from '@ethersproject/contracts'
import { TokenType } from '@xyo-network/crypto-nft-payload-plugin'
import { ERC721__factory, ERC1155__factory } from '@xyo-network/open-zeppelin-typechain'

import { getInterfaceID } from './getInterfaceID'

export const isErc1155 = async (contract: Contract) => {
  return await contract.supportsInterface(getInterfaceID(ERC1155__factory.getInterface(ERC1155__factory.abi)))
}

export const isErc721 = async (contract: Contract) => {
  return await contract.supportsInterface(getInterfaceID(ERC721__factory.getInterface(ERC721__factory.abi)))
}

export const tokenTypes = async (contract: Contract) => {
  const [erc721, erc1155] = await Promise.all([isErc721(contract), isErc1155(contract)])
  const result: TokenType[] = []
  if (erc721) {
    result.push('ERC721')
  }
  if (erc1155) {
    result.push('ERC1155')
  }
  return result
}
