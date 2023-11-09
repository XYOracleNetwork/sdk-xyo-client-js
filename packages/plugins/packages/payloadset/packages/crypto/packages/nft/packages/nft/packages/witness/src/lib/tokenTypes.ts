import { Contract } from '@ethersproject/contracts'
import { TokenType } from '@xyo-network/crypto-nft-payload-plugin'
import { ERC1155URIStorage__factory, IERC721Metadata__factory } from '@xyo-network/open-zeppelin-typechain'

import { contractHasFunctions } from './contractHasFunctions'

export const isErc1155 = async (contract: Contract) => {
  return await contractHasFunctions(contract, ERC1155URIStorage__factory.createInterface(), ['uri'])
}

export const isErc721 = async (contract: Contract) => {
  return await contractHasFunctions(contract, IERC721Metadata__factory.createInterface(), ['name', 'symbol', 'tokenURI'])
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
