export type TokenType = 'ERC721' | 'ERC1155' | null

export const toTokenType = (value: string | null): TokenType => {
  if (value === 'ERC721' || value === 'ERC1155' || value === null) {
    return value
  }
  if (value === undefined) {
    return null
  }
  throw new Error(`${value} is not a valid TokenType`)
}
