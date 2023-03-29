import { Provider } from '@ethersproject/providers'
import {
  defaultCoins,
  defaultCurrencies,
  XyoCoingeckoCryptoMarketWitness,
  XyoCoingeckoCryptoMarketWitnessConfigSchema,
} from '@xyo-network/coingecko-crypto-market-plugin'
import { XyoUniswapCryptoMarketWitnessConfigSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'
import { UniswapPoolContracts, XyoUniswapCryptoMarketWitness } from '@xyo-network/uniswap-crypto-market-plugin'
import { AbstractWitness, WitnessModule } from '@xyo-network/witness'

import { getAccount, WalletPaths } from '../Account'
import { getProvider } from '../Providers'
import { WitnessProvider } from './WitnessProvider'

export const getCryptoMarketWitness: WitnessProvider<Provider> = async (provider = getProvider()): Promise<WitnessModule[]> => {
  const witnesses: AbstractWitness[] = [
    await XyoCoingeckoCryptoMarketWitness.create({
      account: getAccount(WalletPaths.CryptoMarket.Witness.CoingeckoCryptoMarketWitness),
      config: {
        coins: defaultCoins,
        currencies: defaultCurrencies,
        schema: XyoCoingeckoCryptoMarketWitnessConfigSchema,
      },
    }),
    await XyoUniswapCryptoMarketWitness.create({
      account: getAccount(WalletPaths.CryptoMarket.Witness.UniswapCryptoMarketWitness),
      config: {
        pools: UniswapPoolContracts,
        schema: XyoUniswapCryptoMarketWitnessConfigSchema,
      },
      provider,
    }),
  ]
  return witnesses
}
