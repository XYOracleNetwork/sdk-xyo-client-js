import { Module } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoDivinerQuery } from './Queries'

export interface Diviner {
  divine(payloads?: XyoPayloads): Promisable<XyoPayload | null>
}

export interface DivinerModule<TQuery extends XyoDivinerQuery = XyoDivinerQuery> extends Module<TQuery>, Diviner {}
