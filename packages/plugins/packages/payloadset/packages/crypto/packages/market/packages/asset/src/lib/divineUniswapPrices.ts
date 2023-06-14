import { exists } from '@xylabs/exists'
import { AssetInfo, CryptoMarketAssetPayload, CryptoMarketAssetSchema, Currency, Token, ValueBasis } from '@xyo-network/crypto-asset-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { UniswapCryptoMarketPayload, UniswapCryptoPair, UniswapCryptoToken } from '@xyo-network/uniswap-crypto-market-payload-plugin'

const schema = CryptoMarketAssetSchema

const mapUniswapToken = (symbol: string): Token | Currency => {
  // TODO: Actually calculate the value of the token/stablecoin based on others
  // to weed out individual fluctuations in price
  if (symbol.toLowerCase() === 'wbtc') return 'btc'
  if (symbol.toLowerCase() === 'weth') return 'eth'
  if (symbol.toLowerCase() === 'usdt') return 'usd'
  return symbol.toLowerCase() as Token
}

const pairsContainingToken = (uniswapPayload: UniswapCryptoMarketPayload, token: Token) => {
  return uniswapPayload?.pairs
    .map((p) => p.tokens)
    .filter((p) => p.some((x) => x.symbol.toLowerCase() === token))
    .filter(exists)
}

const tokensFromPairs = (pairs: UniswapCryptoPair[]) => {
  return pairs
    .map((p) => p.tokens)
    .flat()
    .map((t) => t.symbol.toLowerCase() as Token)
}

const valuesFromTokenPairs = (tokensPairs: UniswapCryptoToken[][], token: Token): ValueBasis => {
  return Object.fromEntries(
    tokensPairs
      .map((pair) => {
        const current = pair.filter((p) => p.symbol.toLowerCase() === token)?.[0]
        const other = pair.filter((p) => p.symbol.toLowerCase() !== token)?.[0]
        return [other.symbol.toLowerCase(), current.value.toString()]
      })
      .map((x) => [mapUniswapToken(x[0]), x[1]]),
  )
}

export const divineUniswapPrices = (uniswapPayload: UniswapCryptoMarketPayload | undefined): CryptoMarketAssetPayload => {
  let assets: Partial<Record<Token, AssetInfo | undefined>> = {}
  if (uniswapPayload) {
    const tokens: Set<Token> = new Set(tokensFromPairs(uniswapPayload.pairs))
    assets = Object.fromEntries(
      [...tokens].map((token) => {
        const pairs = pairsContainingToken(uniswapPayload, token)
        const value: ValueBasis = valuesFromTokenPairs(pairs, token)
        const assetInfo: AssetInfo = { value }
        return [token, assetInfo]
      }),
    )
  }
  const timestamp = Date.now()
  return new PayloadBuilder<CryptoMarketAssetPayload>({ schema }).fields({ assets, timestamp }).build()
}
