/* eslint-disable @typescript-eslint/no-unused-vars */

import { Module, XyoModule, XyoModuleQueryResult, XyoModuleQuerySchema, XyoQuery } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { Node } from './Node'

export abstract class XyoNode<TModule extends XyoModule = XyoModule> extends XyoModule implements Node<TModule> {
  public get queries(): XyoModuleQuerySchema[] {
    return []
  }
  list(): string[] {
    throw new Error('Method not implemented.')
  }
  attach(module: TModule): void {
    throw new Error('Method not implemented.')
  }
  remove(address: string): void {
    throw new Error('Method not implemented.')
  }
  get(address: string): TModule | undefined {
    throw new Error('Method not implemented.')
  }
}
