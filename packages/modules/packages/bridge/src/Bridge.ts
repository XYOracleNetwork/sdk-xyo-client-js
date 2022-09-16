import { Module } from '@xyo-network/module'
import { Promisable } from '@xyo-network/promise'

import { XyoBridgeQuery } from './Queries'

export interface Bridge {
  connect: () => Promisable<boolean>
  disconnect: () => Promisable<boolean>
}

export interface BridgeModule<TQuery extends XyoBridgeQuery = XyoBridgeQuery> extends Bridge, Module<TQuery> {}
