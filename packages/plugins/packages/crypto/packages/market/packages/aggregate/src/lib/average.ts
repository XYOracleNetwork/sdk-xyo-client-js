import { exists } from '@xylabs/sdk-js'

import { AssetInfo, Currency, Token } from '../MyModels'
import { XyoCryptoMarketAssetPayload } from '../Payload'

const isNumber = (val: number | undefined): val is number => {
  return val !== undefined
}

const parseStringifiedNumber = (value: string | undefined): number | undefined => {
  if (!value) return undefined
  const parsed = parseFloat(value)
  return isNaN(parsed) ? undefined : parsed
}

const averageStringifiedNumbers = (...prices: (string | undefined)[]): number | undefined => {
  const numbers = prices.map(parseStringifiedNumber).filter(isNumber)
  return numbers.length ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : undefined
}

export const average = (...input: (XyoCryptoMarketAssetPayload | undefined)[]): Record<string, AssetInfo> => {
  // Get all the assets represented
  const payloads = input.filter(exists)
  const tokens = new Set<Token>(payloads.map((payload) => Object.keys(payload.assets).map<Token>((t) => t as Token)).flatMap((t) => t))
  // Get all the valuations used
  const valuations = new Set<Token | Currency>(
    [...tokens]
      .map((asset) => {
        const assetInfo = payloads.map((p) => p.assets?.[asset]).filter(exists)
        const valueBasis = new Set<Currency | Token>(
          assetInfo
            .map((v) => Object.keys(v.value) as unknown as Currency | Token)
            .flatMap((v) => v)
            .filter(exists),
        )
        return [...valueBasis]
      })
      .flatMap((v) => v),
  )
  // For each of the tokens, calculate the average valuation for each of valuation bases
  const assets: Record<string, AssetInfo> = Object.fromEntries(
    [...tokens].map((token) => {
      const assetInfo = payloads.map((p) => p.assets?.[token]).filter(exists)
      const value = Object.fromEntries(
        [...valuations].map((valuation) => {
          const assetValuations = assetInfo.map((info) => info.value?.[valuation])
          const averageAssetValuation = averageStringifiedNumbers(...assetValuations)
          return [valuation, averageAssetValuation?.toString()]
        }),
      )
      return [token, { value }]
    }),
  )
  return assets
}
