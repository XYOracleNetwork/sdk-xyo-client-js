import { Provider } from '@ethersproject/providers'
import {
  CoingeckoCryptoMarketWitness,
  CoingeckoCryptoMarketWitnessConfigSchema,
  defaultCoins,
  defaultCurrencies,
} from '@xyo-network/coingecko-crypto-market-plugin'
import { UniswapCryptoMarketWitnessConfigSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'
import { UniswapCryptoMarketWitness, UniswapPoolContracts } from '@xyo-network/uniswap-crypto-market-plugin'
import { AbstractWitness, WitnessModule } from '@xyo-network/witness'

import { getAccount, WalletPaths } from '../Account'
import { getProvider } from '../Providers'
import { WitnessProvider } from './WitnessProvider'

export const getCryptoMarketWitness: WitnessProvider<Provider> = async (provider = getProvider()): Promise<WitnessModule[]> => {
  const witnesses: AbstractWitness[] = [
    await CoingeckoCryptoMarketWitness.create({
      account: getAccount(WalletPaths.CryptoMarket.Witness.Coingecko),
      config: {
        coins: defaultCoins,
        currencies: defaultCurrencies,
        schema: CoingeckoCryptoMarketWitnessConfigSchema,
      },
    }),
    await UniswapCryptoMarketWitness.create({
      account: getAccount(WalletPaths.CryptoMarket.Witness.Uniswap),
      config: {
        pools: UniswapPoolContracts,
        schema: UniswapCryptoMarketWitnessConfigSchema,
      },
      provider,
    }),
  ]
  return witnesses
}
