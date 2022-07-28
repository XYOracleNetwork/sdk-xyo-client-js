import { Provider } from '@ethersproject/providers'
import { XyoQueryPayload } from '@xyo-network/payload'
import { XyoSimpleWitness } from '@xyo-network/witnesses'

export class XyoEthereumWitness<Q extends XyoQueryPayload = XyoQueryPayload, T extends XyoQueryPayload = XyoQueryPayload> extends XyoSimpleWitness<T> {
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
