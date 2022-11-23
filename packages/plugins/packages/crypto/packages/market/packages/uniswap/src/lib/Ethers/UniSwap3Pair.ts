import { Provider } from '@ethersproject/providers'
import { ChainId } from '@uniswap/sdk'
import { Token } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { IERC20Metadata, IERC20Metadata__factory } from '@xyo-network/typechain'
import { IUniswapV3Pool, IUniswapV3Pool__factory } from '@xyo-network/uniswap-typechain'

import { logErrors, logErrorsAsync } from '../logErrors'
import { EthersUniswap3PoolSlot0Wrapper } from './Uniswap3PoolSlot0Wrapper'

//null is used as 'in-progress'
const waitNotNull = async (closure: () => unknown) => {
  while (closure() === null) {
    await delay(10)
  }
}

export class EthersUniSwap3Pair {
  protected address: string
  protected provider: Provider

  private _pool?: Pool | null
  private _poolContract?: IUniswapV3Pool
  private _slot0?: EthersUniswap3PoolSlot0Wrapper | null
  private _tokenContracts: (IERC20Metadata | null | undefined)[] = [undefined, undefined]
  private _tokens: (Token | null | undefined)[] = [undefined, undefined]

  constructor(address: string, provider: Provider) {
    this.address = address
    this.provider = provider
  }

  public async pool(): Promise<Pool> {
    return await logErrorsAsync(async () => {
      await waitNotNull(() => this._pool)
      this._pool = this._pool || null
      const slot0 = await this.slot0()
      this._pool =
        this._pool ??
        new Pool(
          await this.token(0),
          await this.token(1),
          slot0.feeProtocol,
          slot0.sqrtPriceX96.toHexString(),
          (await this.poolContract().liquidity()).toHexString(),
          slot0.tick,
        )
      return assertEx(this._pool)
    })
  }

  public poolContract(): IUniswapV3Pool {
    return logErrors(() => {
      this._poolContract = this._poolContract ?? IUniswapV3Pool__factory.connect(this.address, this.provider)
      return assertEx(this._poolContract)
    })
  }

  public async price() {
    return await logErrorsAsync(async () => {
      const tokenIndexes: (0 | 1)[] = [0, 1]
      const pool = await this.pool()
      const tokens = await Promise.all(tokenIndexes.map((value) => this.token(value)))
      const tokenContracts = await Promise.all(tokenIndexes.map((value) => this.tokenContract(value)))
      const tokenPrices = tokens.map((token) => parseFloat(pool.priceOf(token).toSignificant()))
      const tokenSymbols = tokens.map((token, index) => assertEx(token.symbol, `Token[${index}] Missing Symbols`).toLowerCase())
      const result = {
        tokens: tokenIndexes.map((value) => {
          return { address: tokenContracts[value].address, symbol: tokenSymbols[value], value: tokenPrices[value] }
        }),
      }
      return result
    })
  }

  public async slot0(): Promise<EthersUniswap3PoolSlot0Wrapper> {
    return await logErrorsAsync(async () => {
      await waitNotNull(() => this._slot0)
      this._slot0 = this._slot0 || null
      this._slot0 = this._slot0 ?? new EthersUniswap3PoolSlot0Wrapper(await this.poolContract().slot0())
      return assertEx(this._slot0)
    })
  }

  public async token(index: 0 | 1): Promise<Token> {
    return await logErrorsAsync(async () => {
      await waitNotNull(() => this._tokens[index])
      this._tokens[index] = this._tokens[index] || null
      const tokenContract = await this.tokenContract(index)
      this._tokens[index] =
        this._tokens[index] ??
        new Token(ChainId.MAINNET, tokenContract.address, await tokenContract.decimals(), await tokenContract.symbol(), await tokenContract.name())
      return assertEx(this._tokens[index])
    })
  }

  public async tokenContract(index: 0 | 1): Promise<IERC20Metadata> {
    return await logErrorsAsync(async () => {
      await waitNotNull(() => this._tokenContracts[index])
      this._tokenContracts[index] = this._tokenContracts[index] || null
      this._tokenContracts[index] =
        this._tokenContracts[index] ??
        IERC20Metadata__factory.connect(await (index === 0 ? this.poolContract().token0() : this.poolContract().token1()), this.provider)
      return assertEx(this._tokenContracts[index])
    })
  }
}
