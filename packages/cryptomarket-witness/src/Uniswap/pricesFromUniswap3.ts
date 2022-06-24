import { BigNumber } from '@ethersproject/bignumber'
import { Provider } from '@ethersproject/providers'
import { ChainId } from '@uniswap/sdk'
import { Token } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { assertEx, delay } from '@xylabs/sdk-js'
import { IERC20Metadata, IERC20Metadata__factory, IUniswapV3Pool, IUniswapV3Pool__factory } from '@xyo-network/sdk-xyo-typechain'

import { XyoUniswapCryptoPair } from './CryptoPair'

export type UniswapV3Slot0Fields = [BigNumber, number, number, number, number, number, boolean]

export const uniswapPoolContracts = (provider: Provider) => [
  /*xyo/weth*/ new UniSwap3Pair('0xE331DE28cd81B768C19A366b0e4e4675c45eC2dA', provider),
  /*xyo/usdt*/ new UniSwap3Pair('0xd0AF1981f52146a6939385451dAeA0726e13a484', provider),
  /*xyo/dai*/ new UniSwap3Pair('0x9D7e5647CE3c7C2d835F2F5e82C8fDb36B0BB0fe', provider),
  /*wbtc/xyo*/ new UniSwap3Pair('0x0cF7494c9dE661467403aBeE8454b3BBf0179a84', provider),
  /*link/xyo*/ new UniSwap3Pair('0x4693456599a8a4975862A0E720C5de7E1D09A1e4', provider),
  /*wbtc/weth*/ new UniSwap3Pair('0xCBCdF9626bC03E24f779434178A73a0B4bad62eD', provider),
  /*dai/usdc*/ new UniSwap3Pair('0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168', provider),
  /*usdc/weth*/ new UniSwap3Pair('0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8', provider),
  /*usdc/weth*/ new UniSwap3Pair('0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640', provider),
  /*dai/usdc*/ new UniSwap3Pair('0x6c6Bc977E13Df9b0de53b251522280BB72383700', provider),
  /*frax/usdc*/ new UniSwap3Pair('0xc63B0708E2F7e69CB8A1df0e1389A98C35A76D52', provider),
  /*wbtc/usdc*/ new UniSwap3Pair('0x99ac8cA7087fA4A2A1FB6357269965A2014ABc35', provider),
  /*usdc/usdt*/ new UniSwap3Pair('0x3416cF6C708Da44DB2624D63ea0AAef7113527C6', provider),
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

export class UniSwap3Pair {
  protected provider: Provider
  protected address: string
  constructor(address: string, provider: Provider) {
    this.address = address
    this.provider = provider
  }

  private _poolContract?: IUniswapV3Pool
  public poolContract(): IUniswapV3Pool {
    this._poolContract = this._poolContract ?? IUniswapV3Pool__factory.connect(this.address, this.provider)
    return assertEx(this._poolContract)
  }

  private _token0Contract?: IERC20Metadata | null
  public async token0Contract(): Promise<IERC20Metadata> {
    while (this._token0Contract === null) {
      await delay(10)
    }
    this._token0Contract = this._token0Contract || null
    this._token0Contract = this._token0Contract ?? IERC20Metadata__factory.connect(await this.poolContract().token0(), this.provider)
    return assertEx(this._token0Contract)
  }

  private _token1Contract?: IERC20Metadata | null
  public async token1Contract(): Promise<IERC20Metadata> {
    while (this._token1Contract === null) {
      await delay(10)
    }
    this._token1Contract = this._token1Contract || null
    this._token1Contract = this._token1Contract ?? IERC20Metadata__factory.connect(await this.poolContract().token1(), this.provider)
    return assertEx(this._token1Contract)
  }

  private _token0?: Token | null
  public async token0(): Promise<Token> {
    while (this._token0 === null) {
      await delay(10)
    }
    this._token0 = this._token0 || null
    this._token0 =
      this._token0 ??
      new Token(
        ChainId.MAINNET,
        (await this.token0Contract()).address,
        await (await this.token0Contract()).decimals(),
        await (await this.token0Contract()).symbol(),
        await (await this.token0Contract()).name()
      )
    return assertEx(this._token0)
  }

  private _token1?: Token | null
  public async token1(): Promise<Token> {
    while (this._token1 === null) {
      await delay(10)
    }
    this._token1 = this._token1 || null
    this._token1 =
      this._token1 ??
      new Token(
        ChainId.MAINNET,
        (await this.token1Contract()).address,
        await (await this.token1Contract()).decimals(),
        await (await this.token1Contract()).symbol(),
        await (await this.token1Contract()).name()
      )
    return assertEx(this._token1)
  }

  private _slot0?: Uniswap3PoolSlot0Wrapper | null
  public async slot0(): Promise<Uniswap3PoolSlot0Wrapper> {
    while (this._slot0 === null) {
      await delay(10)
    }
    this._slot0 = this._slot0 || null
    this._slot0 = this._slot0 ?? new Uniswap3PoolSlot0Wrapper(await this.poolContract().slot0())
    return assertEx(this._slot0)
  }

  private _pool?: Pool | null
  public async pool(): Promise<Pool> {
    while (this._pool === null) {
      await delay(10)
    }
    this._pool = this._pool || null
    const slot0 = await this.slot0()
    this._pool =
      this._pool ??
      new Pool(await this.token0(), await this.token1(), slot0.feeProtocol, slot0.sqrtPriceX96.toHexString(), (await this.poolContract().liquidity()).toHexString(), slot0.tick)
    return assertEx(this._pool)
  }

  public async price() {
    const pool = await this.pool()
    const token0 = await this.token0()
    const token1 = await this.token1()
    const token0Price = parseFloat(pool.priceOf(await this.token0()).toSignificant())
    const token1Price = parseFloat(pool.priceOf(token1).toSignificant())
    const token0Symbol = assertEx(token0.symbol, 'Token0 Missing Symbols').toLowerCase()
    const token1Symbol = assertEx(token1.symbol, 'Token1 Missing Symbols').toLowerCase()
    const result = {
      tokens: [
        { address: (await this.token0Contract()).address, symbol: token0Symbol, value: token0Price },
        { address: (await this.token1Contract()).address, symbol: token1Symbol, value: token1Price },
      ],
    }
    return result
  }
}

export const pricesFromUniswap3 = async (pools: UniSwap3Pair[]): Promise<XyoUniswapCryptoPair[]> => {
  const promiseResults = await Promise.allSettled(
    pools.map(async (pool): Promise<XyoUniswapCryptoPair> => {
      return await pool.price()
    })
  )

  return (promiseResults.filter((result) => result.status === 'fulfilled') as PromiseFulfilledResult<XyoUniswapCryptoPair>[]).map((result) => result.value)
}
