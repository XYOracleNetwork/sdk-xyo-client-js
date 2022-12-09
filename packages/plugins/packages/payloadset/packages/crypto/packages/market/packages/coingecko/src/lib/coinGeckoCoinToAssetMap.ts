import { AssetSymbol } from '@xyo-network/coingecko-crypto-market-payload-plugin'

export const coingeckoCoinToAssetMap: Record<string, AssetSymbol> = {
  'binance-usd': 'busd',
  bitcoin: 'btc',
  bnb: 'bnb',
  cardano: 'ada',
  dogecoin: 'doge',
  ethereum: 'eth',
  polkadot: 'dot',
  solana: 'sol',
  tether: 'usdt',
  'usd-coin': 'usdc',
  'wrapped-bitcoin': 'wbtc',
  xrp: 'xrp',
  'xyo-network': 'xyo',
}
