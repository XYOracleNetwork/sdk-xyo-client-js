import { Provider } from '@ethersproject/providers'
import { XyoQueryPayload, XyoWitness } from '@xyo-network/core'

export class XyoEthereumWitness<Q extends XyoQueryPayload = XyoQueryPayload, T extends XyoQueryPayload = XyoQueryPayload> extends XyoWitness<T> {
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
    return await super.observe(fields)
  }

  public static schema = 'network.xyo.blockchain.ethereum'
}
