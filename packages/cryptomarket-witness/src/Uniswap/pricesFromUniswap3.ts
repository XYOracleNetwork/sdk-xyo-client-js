import { Provider } from '@ethersproject/providers'
import { ChainId } from '@uniswap/sdk'
import { Token } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { assertEx } from '@xylabs/sdk-js'
import { IERC20Metadata__factory, IUniswapV3Pool__factory } from '@xyo-network/sdk-xyo-typechain'
import { BigNumber } from 'ethers'

import { XyoUniswapCryptoPair } from './CryptoPair'

export type UniswapV3Slot0Fields = [BigNumber, number, number, number, number, number, boolean]

export const UniswapPoolContracts = [
  /*xyo/weth*/ '0xE331DE28cd81B768C19A366b0e4e4675c45eC2dA',
  /*xyo/usdt*/ '0xd0AF1981f52146a6939385451dAeA0726e13a484',
  /*xyo/dai*/ '0x9D7e5647CE3c7C2d835F2F5e82C8fDb36B0BB0fe',
  /*wbtc/xyo*/ '0x0cF7494c9dE661467403aBeE8454b3BBf0179a84',
  /*link/xyo*/ '0x4693456599a8a4975862A0E720C5de7E1D09A1e4',
  /*wbtc/weth*/ '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD',
  /*dai/usdc*/ '0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168',
  /*usdc/weth*/ '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8',
  /*usdc/weth*/ '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
  /*dai/usdc*/ '0x6c6Bc977E13Df9b0de53b251522280BB72383700',
  /*frax/usdc*/ '0xc63B0708E2F7e69CB8A1df0e1389A98C35A76D52',
  /*wbtc/usdc*/ '0x99ac8cA7087fA4A2A1FB6357269965A2014ABc35',
  /*usdc/usdt*/ '0x3416cF6C708Da44DB2624D63ea0AAef7113527C6',
]
export class Uniswap3PoolSlot0Wrapper {
  protected values: UniswapV3Slot0Fields
  constructor(values: UniswapV3Slot0Fields) {
    this.values = values
  }

  get sqrtPriceX96() {
    return this.values[0]
  }

  get tick() {
    return this.values[1]
  }

  get observationIndex() {
    return this.values[2]
  }

  get observationCardinality() {
    return this.values[3]
  }

  get observationCardinalityNext() {
    return this.values[4]
  }

  get feeProtocol() {
    return this.values[5]
  }

  get unlocked() {
    return this.values[6]
  }
}

export const pricesFromUniswap3 = async (provider: Provider, pools = UniswapPoolContracts): Promise<XyoUniswapCryptoPair[]> => {
  const promiseResults = await Promise.allSettled(
    pools.map(async (poolAddress): Promise<XyoUniswapCryptoPair> => {
      const poolContract = IUniswapV3Pool__factory.connect(poolAddress, provider)
      const token0Contract = IERC20Metadata__factory.connect(await poolContract.token0(), provider)
      const token1Contract = IERC20Metadata__factory.connect(await poolContract.token1(), provider)
      const token0 = new Token(ChainId.MAINNET, token0Contract.address, await token0Contract.decimals(), await token0Contract.symbol(), await token0Contract.name())
      const token1 = new Token(ChainId.MAINNET, token1Contract.address, await token1Contract.decimals(), await token1Contract.symbol(), await token1Contract.name())
      const slot0 = new Uniswap3PoolSlot0Wrapper(await poolContract.slot0())
      const pool = new Pool(token0, token1, slot0.feeProtocol, slot0.sqrtPriceX96.toHexString(), (await poolContract.liquidity()).toHexString(), slot0.tick)
      const token0Price = parseFloat(pool.priceOf(token0).toSignificant())
      const token1Price = parseFloat(pool.priceOf(token1).toSignificant())
      const token0Symbol = assertEx(token0.symbol, 'Token0 Missing Symbols').toLowerCase()
      const token1Symbol = assertEx(token1.symbol, 'Token1 Missing Symbols').toLowerCase()
      return {
        tokens: [
          { address: token0Contract.address, symbol: token0Symbol, value: token0Price },
          { address: token1Contract.address, symbol: token1Symbol, value: token1Price },
        ],
      }
    })
  )

  return (promiseResults.filter((result) => result.status === 'fulfilled') as PromiseFulfilledResult<XyoUniswapCryptoPair>[]).map((result) => result.value)
}
