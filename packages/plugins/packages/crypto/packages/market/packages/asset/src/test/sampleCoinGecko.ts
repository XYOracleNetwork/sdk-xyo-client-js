import { XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketSchema } from '@xyo-network/coingecko-crypto-market-payload-plugin'

export const sampleCoinGeckoPayload: XyoCoingeckoCryptoMarketPayload = {
  assets: {
    ada: {
      btc: 0.00002163,
      eth: 0.00030472,
      eur: 0.488106,
      usd: 0.495442,
    },
    btc: {
      btc: 1,
      eth: 14.068021,
      eur: 22545,
      usd: 22884,
    },
    busd: {
      btc: 0.00004342,
      eth: 0.00061145,
      eur: 0.979882,
      usd: 0.994609,
    },
    doge: {
      btc: 0.00000288,
      eth: 0.00004062,
      eur: 0.065066,
      usd: 0.066044,
    },
    dot: {
      btc: 0.00033067,
      eth: 0.00465702,
      eur: 7.46,
      usd: 7.58,
    },
    eth: {
      btc: 0.07099216,
      eth: 1,
      eur: 1602.25,
      usd: 1626.33,
    },
    sol: {
      btc: 0.00173417,
      eth: 0.02442315,
      eur: 39.14,
      usd: 39.73,
    },
    usdc: {
      btc: 0.00004371,
      eth: 0.00061556,
      eur: 0.986471,
      usd: 1.001,
    },
    usdt: {
      btc: 0.0000437,
      eth: 0.00061548,
      eur: 0.986332,
      usd: 1.001,
    },
    wbtc: {
      btc: 1.000635,
      eth: 14.092397,
      eur: 22584,
      usd: 22923,
    },
    xyo: {
      btc: 6.28282e-7,
      eth: 0.00000885,
      eur: 0.01417995,
      usd: 0.01439307,
    },
  },
  schema: XyoCoingeckoCryptoMarketSchema,
  timestamp: 1659012060785,
}
