import { XyoCoingeckoCryptoMarketPayload } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { XyoUniswapCryptoMarketPayload } from '@xyo-network/uniswap-crypto-market-payload-plugin'

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
  schema: 'network.xyo.crypto.market.coingecko',
  timestamp: 1659012060785,
}

export const sampleUniswapPayload: XyoUniswapCryptoMarketPayload = {
  pairs: [
    {
      tokens: [
        {
          address: '0x55296f69f40Ea6d20E478533C15A6B08B654E758',
          symbol: 'xyo',
          value: 0.00000896773,
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          symbol: 'weth',
          value: 111511,
        },
      ],
    },
    {
      tokens: [
        {
          address: '0x55296f69f40Ea6d20E478533C15A6B08B654E758',
          symbol: 'xyo',
          value: 0.0148782,
        },
        {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          symbol: 'usdt',
          value: 67.2123,
        },
      ],
    },
    {
      tokens: [
        {
          address: '0x55296f69f40Ea6d20E478533C15A6B08B654E758',
          symbol: 'xyo',
          value: 0.014039,
        },
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          symbol: 'dai',
          value: 71.2301,
        },
      ],
    },
    {
      tokens: [
        {
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          symbol: 'wbtc',
          value: 1527240,
        },
        {
          address: '0x55296f69f40Ea6d20E478533C15A6B08B654E758',
          symbol: 'xyo',
          value: 6.54777e-7,
        },
      ],
    },
    {
      tokens: [
        {
          address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
          symbol: 'link',
          value: 453.816,
        },
        {
          address: '0x55296f69f40Ea6d20E478533C15A6B08B654E758',
          symbol: 'xyo',
          value: 0.00220354,
        },
      ],
    },
    {
      tokens: [
        {
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          symbol: 'wbtc',
          value: 14.0836,
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          symbol: 'weth',
          value: 0.0710048,
        },
      ],
    },
    {
      tokens: [
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          symbol: 'dai',
          value: 1.00004,
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'usdc',
          value: 0.999959,
        },
      ],
    },
    {
      tokens: [
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'usdc',
          value: 0.000616944,
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          symbol: 'weth',
          value: 1620.89,
        },
      ],
    },
    {
      tokens: [
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'usdc',
          value: 0.000617196,
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          symbol: 'weth',
          value: 1620.23,
        },
      ],
    },
    {
      tokens: [
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          symbol: 'dai',
          value: 1.00002,
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'usdc',
          value: 0.999983,
        },
      ],
    },
    {
      tokens: [
        {
          address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
          symbol: 'frax',
          value: 0.999762,
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'usdc',
          value: 1.00024,
        },
      ],
    },
    {
      tokens: [
        {
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          symbol: 'wbtc',
          value: 22826.3,
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'usdc',
          value: 0.000043809,
        },
      ],
    },
    {
      tokens: [
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'usdc',
          value: 0.999853,
        },
        {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          symbol: 'usdt',
          value: 1.00015,
        },
      ],
    },
  ],
  schema: 'network.xyo.crypto.market.uniswap',
  timestamp: 1659012011418,
}

describe('sampleResponses', () => {
  it.each([sampleCoinGeckoPayload, sampleUniswapPayload])('has sample responses', (response) => {
    expect(response).toBeObject()
  })
})
