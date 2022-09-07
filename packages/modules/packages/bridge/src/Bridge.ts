import { Module } from '@xyo-network/module'
import { Promisable } from '@xyo-network/promisable'

import { XyoBridgeQuery } from './Queries'

export interface Bridge {
  connect: (uri?: string) => Promisable<boolean>
  disconnect: (uri?: string) => Promisable<boolean>
}

export interface BridgeModule<TQuery extends XyoBridgeQuery = XyoBridgeQuery> extends Bridge, Module<TQuery> {}
