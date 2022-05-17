import { Provider } from '@ethersproject/providers'
import { XyoWitness } from '@xyo-network/core'

import { XyoEthereumAccountBalancePayload, XyoEthereumAccountBalanceQueryPayload, XyoEthereumPayload, XyoEthereumQueryPayload } from './Payload'

export class XyoEthereumWitness<Q extends XyoEthereumQueryPayload = XyoEthereumQueryPayload, T extends XyoEthereumPayload = XyoEthereumPayload> extends XyoWitness<T> {
  protected query: Q
  protected provider: Provider
  constructor({ provider, query, schema = XyoEthereumWitness.schema }: { provider: Provider; query: Q; schema: string }) {
    super({
      schema,
    })
    this.query = query
    this.provider = provider
  }

  override async observe(fields?: Partial<T>): Promise<T> {
    const blockNumber = await this.provider.getBlockNumber()
    return await super.observe({ ...fields, ...({ blockNumber, network: this.query.network, timestamp: Date.now() } as T) })
  }

  public static schema = 'network.xyo.blockchain.ethereum'
}

export class XyoEthereumAccountWitness<
  Q extends XyoEthereumAccountBalanceQueryPayload = XyoEthereumAccountBalanceQueryPayload,
  T extends XyoEthereumAccountBalancePayload = XyoEthereumAccountBalancePayload
> extends XyoEthereumWitness<Q, T> {
  constructor({ provider, query, schema = XyoEthereumAccountWitness.schema }: { provider: Provider; query: Q; schema: string }) {
    super({ provider, query, schema })
  }

  override async observe(fields?: Partial<T>): Promise<T> {
    const balance = await this.provider.getBalance(this.query.address)
    return await super.observe({ ...fields, balance: balance.toHexString() } as T)
  }

  public static schema = 'network.xyo.blockchain.ethereum.account'
}
