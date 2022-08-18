import { XyoModule, XyoModuleQueryResult } from '@xyo-network/module'
import { XyoQueryPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

export interface XyoNode {
  attach(module: XyoModule): void
  remove(address: string): void
  list(): string[]
  get<T extends XyoModule>(address: string): T | undefined
  query(address: string, query: XyoQueryPayload): Promisable<XyoModuleQueryResult>
}
