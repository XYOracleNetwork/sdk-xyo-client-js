import cryptos from './reservedCryptos.json'

export interface Crypto {
  name: string
  symbol: string
}

export const reservedCryptos: Crypto[] = Object.entries(cryptos).map(([symbol, name]) => ({ name, symbol }) as Crypto)
