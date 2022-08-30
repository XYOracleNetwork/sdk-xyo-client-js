/* eslint-disable @typescript-eslint/no-unused-vars */

import { XyoModule, XyoModuleQueryResult, XyoQueryPayload } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoNode } from './Node'

export abstract class XyoAbstractNode implements XyoNode {
  list(): string[] {
    throw new Error('Method not implemented.')
  }
  attach(module: XyoModule<XyoQueryPayload<XyoPayload>>): void {
    throw new Error('Method not implemented.')
  }
  remove(address: string): void {
    throw new Error('Method not implemented.')
  }
  get<T extends XyoModule<XyoQueryPayload<XyoPayload>>>(address: string): T | undefined {
    throw new Error('Method not implemented.')
  }
  query(address: string, query: XyoQueryPayload<XyoPayload>): Promisable<XyoModuleQueryResult> {
    throw new Error('Method not implemented.')
  }
}
