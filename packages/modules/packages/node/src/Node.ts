import { XyoModule, XyoModuleQueryResult, XyoQueryPayload } from '@xyo-network/module'
import { Promisable } from '@xyo-network/promisable'

export interface XyoNode extends XyoModule {
  attach(module: XyoModule): void
  remove(address: string): void
  list(): string[]
  get<T extends XyoModule>(address: string): T | undefined
  query(address: string, query: XyoQueryPayload): Promisable<XyoModuleQueryResult>
}
