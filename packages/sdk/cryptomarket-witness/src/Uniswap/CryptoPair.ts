export interface XyoCryptoUniswapToken {
  address: string
  symbol: string
  value: number
}

export interface XyoUniswapCryptoPair {
  tokens: XyoCryptoUniswapToken[]
}
