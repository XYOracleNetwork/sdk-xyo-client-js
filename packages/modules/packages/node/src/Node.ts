import { XyoModule, XyoModuleQueryResult, XyoQueryPayload } from '@xyo-network/module'
import { Promisable } from '@xyo-network/promisable'

export interface Node<TModule extends XyoModule = XyoModule> {
  attach(module: TModule): void
  remove(address: string): void
  list(): string[]
  get(address: string): TModule | undefined
  query(address: string, query: XyoQueryPayload): Promisable<XyoModuleQueryResult | undefined>
}
