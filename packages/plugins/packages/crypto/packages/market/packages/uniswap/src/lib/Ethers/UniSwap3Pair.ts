import { Provider } from '@ethersproject/providers'
import { ChainId } from '@uniswap/sdk'
import { Token } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { IERC20Metadata, IERC20Metadata__factory, IUniswapV3Pool, IUniswapV3Pool__factory } from '@xyo-network/sdk-xyo-typechain'

import { logErrors, logErrorsAsync } from '../logErrors'
import { EthersUniswap3PoolSlot0Wrapper } from './Uniswap3PoolSlot0Wrapper'

export class EthersUniSwap3Pair {
  protected provider: Provider
  protected address: string
  constructor(address: string, provider: Provider) {
    this.address = address
    this.provider = provider
  }

  private _poolContract?: IUniswapV3Pool
  public poolContract(): IUniswapV3Pool {
    return logErrors(() => {
      this._poolContract = this._poolContract ?? IUniswapV3Pool__factory.connect(this.address, this.provider)
      return assertEx(this._poolContract)
    })
  }

  private _token0Contract?: IERC20Metadata | null
  public async token0Contract(): Promise<IERC20Metadata> {
    return await logErrorsAsync(async () => {
      while (this._token0Contract === null) {
        await delay(10)
      }
      this._token0Contract = this._token0Contract || null
      this._token0Contract = this._token0Contract ?? IERC20Metadata__factory.connect(await this.poolContract().token0(), this.provider)
      return assertEx(this._token0Contract)
    })
  }

  private _token1Contract?: IERC20Metadata | null
  public async token1Contract(): Promise<IERC20Metadata> {
    return await logErrorsAsync(async () => {
      while (this._token1Contract === null) {
        await delay(10)
      }
      this._token1Contract = this._token1Contract || null
      this._token1Contract = this._token1Contract ?? IERC20Metadata__factory.connect(await this.poolContract().token1(), this.provider)
      return assertEx(this._token1Contract)
    })
  }

  private _token0?: Token | null
  public async token0(): Promise<Token> {
    return await logErrorsAsync(async () => {
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
          await (await this.token0Contract()).name(),
        )
      return assertEx(this._token0)
    })
  }

  private _token1?: Token | null
  public async token1(): Promise<Token> {
    return await logErrorsAsync(async () => {
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
          await (await this.token1Contract()).name(),
        )
      return assertEx(this._token1)
    })
  }

  private _slot0?: EthersUniswap3PoolSlot0Wrapper | null
  public async slot0(): Promise<EthersUniswap3PoolSlot0Wrapper> {
    return await logErrorsAsync(async () => {
      while (this._slot0 === null) {
        await delay(10)
      }
      this._slot0 = this._slot0 || null
      this._slot0 = this._slot0 ?? new EthersUniswap3PoolSlot0Wrapper(await this.poolContract().slot0())
      return assertEx(this._slot0)
    })
  }

  private _pool?: Pool | null
  public async pool(): Promise<Pool> {
    return await logErrorsAsync(async () => {
      while (this._pool === null) {
        await delay(10)
      }
      this._pool = this._pool || null
      const slot0 = await this.slot0()
      this._pool =
        this._pool ??
        new Pool(
          await this.token0(),
          await this.token1(),
          slot0.feeProtocol,
          slot0.sqrtPriceX96.toHexString(),
          (await this.poolContract().liquidity()).toHexString(),
          slot0.tick,
        )
      return assertEx(this._pool)
    })
  }

  public async price() {
    return await logErrorsAsync(async () => {
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
    })
  }
}
