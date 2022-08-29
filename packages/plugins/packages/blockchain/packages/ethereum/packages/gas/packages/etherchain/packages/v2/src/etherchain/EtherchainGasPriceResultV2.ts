export interface EtherchainGasPriceResultV2 {
  code: number
  data: {
    rapid: number
    fast: number
    standard: number
    slow: number
    timestamp: number
    priceUSD: number
  }
}
