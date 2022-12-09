import { XyoUniswapCryptoPair } from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { EthersUniSwap3Pair } from './Ethers'
import { logErrorsAsync } from './logErrors'

export const pricesFromUniswap3 = async (pools: EthersUniSwap3Pair[]): Promise<XyoUniswapCryptoPair[]> => {
  return await logErrorsAsync(async () => {
    const promiseResults = await Promise.allSettled(
      pools.map(async (pool): Promise<XyoUniswapCryptoPair> => {
        const result = await pool.price()
        return result
      }),
    )

    return (promiseResults.filter((result) => result.status === 'fulfilled') as PromiseFulfilledResult<XyoUniswapCryptoPair>[]).map(
      (result) => result.value,
    )
  })
}
