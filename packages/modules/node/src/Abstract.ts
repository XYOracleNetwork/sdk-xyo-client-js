/* eslint-disable @typescript-eslint/no-unused-vars */
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoModule } from '@xyo-network/module'
import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoNode } from './Node'

export abstract class XyoAbstractNode implements XyoNode {
  attach(module: XyoModule<XyoQueryPayload<XyoPayload>>): void {
    throw new Error('Method not implemented.')
  }
  remove(address: string): void {
    throw new Error('Method not implemented.')
  }
  get<T extends XyoModule<XyoQueryPayload<XyoPayload>>>(address: string): T | undefined {
    throw new Error('Method not implemented.')
  }
  query(query: XyoQueryPayload<XyoPayload>): Promisable<[XyoBoundWitness, XyoPayload[]]> {
    throw new Error('Method not implemented.')
  }
}
