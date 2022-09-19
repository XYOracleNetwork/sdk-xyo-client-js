import { Module } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable, PromisableArray } from '@xyo-network/promise'

import { Node } from './Node'
import { XyoNodeQuery } from './Queries'

export interface NodeModule<TQuery extends XyoNodeQuery = XyoNodeQuery, TQueryResult extends XyoPayload = XyoPayload, TModule extends Module = Module>
  extends Node,
    Module<TQuery, TQueryResult> {
  registeredModules(): PromisableArray<TModule>
  attachedModules(): PromisableArray<TModule>
  resolve(address: string): Promisable<TModule | null>
  register(module: TModule): Promisable<void>
}
